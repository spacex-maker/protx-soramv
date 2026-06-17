export const fileToBase64 = (file: File | Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const getAudioFormatFromFile = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext) return ext;
  if (file.type.includes('mpeg')) return 'mp3';
  if (file.type.includes('wav')) return 'wav';
  if (file.type.includes('mp4') || file.type.includes('m4a')) return 'm4a';
  if (file.type.includes('aac')) return 'aac';
  return 'mp3';
};

export const formatRecordDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const isSecureRecordingContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext === true;
};

export const isRecordingSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!isSecureRecordingContext()) return false;
  return !!(getGetUserMediaFn() && (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'));
};

type GetUserMediaFn = (constraints: MediaStreamConstraints) => Promise<MediaStream>;

const getGetUserMediaFn = (): GetUserMediaFn | null => {
  if (typeof navigator === 'undefined') return null;
  if (navigator.mediaDevices?.getUserMedia) {
    return constraints => navigator.mediaDevices.getUserMedia(constraints);
  }
  const legacyGetUserMedia =
    (navigator as any).getUserMedia
    || (navigator as any).webkitGetUserMedia
    || (navigator as any).mozGetUserMedia;
  if (typeof legacyGetUserMedia === 'function') {
    return constraints => new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
  return null;
};

export const getUserMediaStream = async (): Promise<MediaStream> => {
  if (!isSecureRecordingContext()) {
    throw new Error('INSECURE_CONTEXT');
  }
  const getUserMedia = getGetUserMediaFn();
  if (!getUserMedia) {
    throw new Error('NOT_SUPPORTED');
  }

  const constraintAttempts: MediaStreamConstraints[] = [
    {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    },
    { audio: true },
  ];

  let lastError: unknown;
  for (const constraints of constraintAttempts) {
    try {
      const stream = await getUserMedia(constraints);
      if (stream.getAudioTracks().length > 0) {
        return stream;
      }
      stream.getTracks().forEach(track => track.stop());
      throw new Error('NO_AUDIO_TRACK');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('GET_USER_MEDIA_FAILED');
};

export const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const channelCount = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const mono = new Float32Array(frameCount);

  for (let ch = 0; ch < channelCount; ch += 1) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i += 1) {
      mono[i] += channelData[i] / channelCount;
    }
  }

  return encodeMonoPcmToWav(mono, sampleRate);
};

export const encodeMonoPcmToWav = (samples: Float32Array, sampleRate: number): Blob => {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/** 使用 Web Audio 直录 WAV，桌面浏览器兼容性优于 MediaRecorder */
export class WavStreamRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private silentGainNode: GainNode | null = null;
  private recordedSamples: Float32Array[] = [];
  private sampleRate = 48000;
  private capturing = false;

  async start(): Promise<void> {
    this.cleanupNodes();
    this.recordedSamples = [];
    this.mediaStream = await getUserMediaStream();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.sampleRate = this.audioContext.sampleRate;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.silentGainNode = this.audioContext.createGain();
    this.silentGainNode.gain.value = 0;

    this.processorNode.onaudioprocess = event => {
      if (!this.capturing) return;
      const channel = event.inputBuffer.getChannelData(0);
      this.recordedSamples.push(new Float32Array(channel));
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.silentGainNode);
    this.silentGainNode.connect(this.audioContext.destination);
    this.capturing = true;
  }

  async stop(): Promise<{ blob: Blob; durationSec: number }> {
    this.capturing = false;

    const totalSamples = this.recordedSamples.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Float32Array(totalSamples);
    let offset = 0;
    for (const chunk of this.recordedSamples) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const durationSec = this.sampleRate > 0 ? merged.length / this.sampleRate : 0;
    const blob = encodeMonoPcmToWav(merged, this.sampleRate);

    this.cleanupNodes();
    return { blob, durationSec: Math.max(0, Math.round(durationSec)) };
  }

  cancel(): void {
    this.capturing = false;
    this.cleanupNodes();
  }

  private cleanupNodes(): void {
    this.processorNode?.disconnect();
    this.sourceNode?.disconnect();
    this.silentGainNode?.disconnect();
    this.processorNode = null;
    this.sourceNode = null;
    this.silentGainNode = null;

    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.recordedSamples = [];
  }
}

export const getRecordingErrorMessageId = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === 'INSECURE_CONTEXT') return 'create.voiceClone.recordInsecureContext';
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'create.voiceClone.recordPermissionDenied';
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'create.voiceClone.recordNoDevice';
    }
    if (error.message === 'NOT_SUPPORTED') return 'create.voiceClone.recordNotSupported';
  }
  return 'create.voiceClone.recordStartFailed';
};
