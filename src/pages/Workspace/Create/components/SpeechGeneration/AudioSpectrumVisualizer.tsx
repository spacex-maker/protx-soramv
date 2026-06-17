import React, { useCallback, useEffect, useRef } from 'react';
import { SpectrumCanvas, SpectrumVisualizerWrap } from './styles';

const BAR_COUNT = 64;
const MIN_BAR_HEIGHT = 0.04;

const mapBarToFreqIndex = (barIndex: number, binCount: number) => {
  const minBin = 1;
  const maxBin = Math.max(minBin + 1, binCount - 1);
  const t = barIndex / Math.max(1, BAR_COUNT - 1);
  return Math.min(maxBin, Math.floor(minBin + Math.pow(t, 1.65) * (maxBin - minBin)));
};

const amplifySpectrumValue = (value: number) => Math.pow(Math.max(0, value), 0.72);

type AudioGraph = {
  ctx: AudioContext;
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  freqData: Uint8Array;
};

const audioGraphCache = new WeakMap<HTMLMediaElement, AudioGraph>();

const getOrCreateAudioGraph = async (audio: HTMLMediaElement): Promise<AudioGraph | null> => {
  const cached = audioGraphCache.get(audio);
  if (cached) {
    if (cached.ctx.state === 'suspended') {
      try {
        await cached.ctx.resume();
      } catch {
        /* ignore */
      }
    }
    return cached;
  }

  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.82;
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;

  const source = ctx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(ctx.destination);

  const graph: AudioGraph = {
    ctx,
    source,
    analyser,
    freqData: new Uint8Array(analyser.frequencyBinCount),
  };
  audioGraphCache.set(audio, graph);

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }

  return graph;
};

interface AudioSpectrumVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioUrl: string | null;
  playing: boolean;
}

const drawBars = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  values: number[],
  active: boolean,
  isDark: boolean,
) => {
  ctx.clearRect(0, 0, width, height);
  const gap = 2;
  const barWidth = Math.max(2, (width - gap * (BAR_COUNT - 1)) / BAR_COUNT);
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  if (active) {
    gradient.addColorStop(0, '#13c2c2');
    gradient.addColorStop(0.55, '#22d3ee');
    gradient.addColorStop(1, '#3b82f6');
  } else {
    gradient.addColorStop(0, isDark ? '#334155' : '#cbd5e1');
    gradient.addColorStop(1, isDark ? '#5eead4' : '#13c2c2');
  }

  values.forEach((value, index) => {
    const normalized = Math.max(MIN_BAR_HEIGHT, Math.min(1, amplifySpectrumValue(value)));
    const barHeight = Math.max(3, normalized * height * 0.92);
    const x = index * (barWidth + gap);
    const y = height - barHeight;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 999);
    ctx.fill();
  });
};

const normalizeWaveform = (samples: Float32Array, bars: number): number[] => {
  const blockSize = Math.max(1, Math.floor(samples.length / bars));
  const values: number[] = [];
  for (let i = 0; i < bars; i += 1) {
    let peak = 0;
    const start = i * blockSize;
    const end = Math.min(samples.length, start + blockSize);
    for (let j = start; j < end; j += 1) {
      peak = Math.max(peak, Math.abs(samples[j]));
    }
    values.push(peak);
  }
  const max = Math.max(...values, 0.001);
  return values.map(v => v / max);
};

const AudioSpectrumVisualizer: React.FC<AudioSpectrumVisualizerProps> = ({
  audioRef,
  audioUrl,
  playing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const waveformRef = useRef<number[]>(Array.from({ length: BAR_COUNT }, () => MIN_BAR_HEIGHT));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);

  const isDarkMode = () =>
    document.documentElement.getAttribute('data-theme') === 'dark'
    || window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  const renderBars = useCallback((values: number[], active: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBars(ctx, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1), values, active, isDarkMode());
  }, []);

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const graph = await getOrCreateAudioGraph(audio);
    if (!graph) return;

    audioContextRef.current = graph.ctx;
    analyserRef.current = graph.analyser;
    sourceRef.current = graph.source;
    freqDataRef.current = graph.freqData;
  }, [audioRef]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    const freqData = freqDataRef.current;
    if (!analyser || !freqData) return;

    analyser.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>);
    const values = Array.from({ length: BAR_COUNT }, (_, index) => {
      const center = mapBarToFreqIndex(index, freqData.length);
      const spread = Math.max(1, Math.floor(freqData.length / BAR_COUNT / 2));
      const start = Math.max(0, center - spread);
      const end = Math.min(freqData.length, center + spread + 1);
      let peak = 0;
      for (let i = start; i < end; i += 1) {
        peak = Math.max(peak, freqData[i]);
      }
      return peak / 255;
    });

    renderBars(values, true);
    rafRef.current = requestAnimationFrame(tick);
  }, [renderBars]);

  const startLoop = useCallback(async () => {
    await ensureAudioGraph();
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch {
        /* ignore */
      }
    }
    stopLoop();
    rafRef.current = requestAnimationFrame(tick);
  }, [ensureAudioGraph, stopLoop, tick]);

  useEffect(() => {
    let cancelled = false;

    const loadWaveform = async () => {
      if (!audioUrl) {
        waveformRef.current = Array.from({ length: BAR_COUNT }, () => MIN_BAR_HEIGHT);
        renderBars(waveformRef.current, false);
        return;
      }

      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('fetch failed');
        const buffer = await response.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) throw new Error('no audio context');
        const ctx = new AudioCtx();
        const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
        await ctx.close();
        if (cancelled) return;
        waveformRef.current = normalizeWaveform(audioBuffer.getChannelData(0), BAR_COUNT);
        if (!playing) {
          renderBars(waveformRef.current, false);
        }
      } catch {
        if (cancelled) return;
        waveformRef.current = Array.from({ length: BAR_COUNT }, () => MIN_BAR_HEIGHT);
        if (!playing) {
          renderBars(waveformRef.current, false);
        }
      }
    };

    loadWaveform();
    return () => {
      cancelled = true;
    };
  }, [audioUrl, playing, renderBars]);

  useEffect(() => {
    if (!audioUrl) {
      return undefined;
    }
    void ensureAudioGraph();
    return undefined;
  }, [audioUrl, ensureAudioGraph]);

  useEffect(() => {
    if (playing) {
      void startLoop();
    } else {
      stopLoop();
      renderBars(waveformRef.current, false);
    }
  }, [playing, startLoop, stopLoop, renderBars]);

  useEffect(() => {
    resizeCanvas();
    renderBars(waveformRef.current, playing);

    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      renderBars(waveformRef.current, playing);
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [playing, renderBars, resizeCanvas]);

  useEffect(() => () => {
    stopLoop();
  }, [stopLoop]);

  return (
    <SpectrumVisualizerWrap ref={wrapRef} aria-hidden>
      <SpectrumCanvas ref={canvasRef} />
    </SpectrumVisualizerWrap>
  );
};

export default AudioSpectrumVisualizer;
