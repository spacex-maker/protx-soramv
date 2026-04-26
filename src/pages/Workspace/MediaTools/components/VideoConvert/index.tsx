import React, { useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Progress, Radio, Row, Select, Space, Typography, Upload, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, RetweetOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { initFFmpeg, formatSize, terminateFFmpegInstance } from '../VideoCompress/utils';
import { isWebCodecsAvailable, transcodeWithWebCodecs } from './webcodecsTranscoder';

const { Dragger } = Upload;
const { Paragraph, Text } = Typography;

type OutputFormat = 'mp4' | 'webm' | 'avi' | 'mov';
type DeviceMode = 'cpu' | 'gpu';

const SUPPORTED_FORMATS: Array<{ label: string; value: OutputFormat }> = [
  { label: 'MP4 (H.264)', value: 'mp4' },
  { label: 'WebM (VP9)', value: 'webm' },
  { label: 'AVI', value: 'avi' },
  { label: 'MOV', value: 'mov' },
];

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DeviceCard = styled(Card)`
  border-radius: 14px;
`;

const ConvertCard = styled(Card)`
  border-radius: 14px;
  height: 100%;
`;

const ResultPreview = styled.video`
  width: 100%;
  max-height: 260px;
  border-radius: 10px;
  background: #000;
`;

const getGpuInfo = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const webglCtx = gl as WebGLRenderingContext;
    const debugInfo = webglCtx.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'WebGL GPU';

    const renderer = webglCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer ? String(renderer) : 'WebGL GPU';
  } catch {
    return null;
  }
};

const buildCommandArgs = (inputName: string, outputName: string, format: OutputFormat): string[] => {
  if (format === 'webm') {
    return [
      '-i', inputName,
      '-c:v', 'libvpx-vp9',
      '-b:v', '1.2M',
      '-c:a', 'libopus',
      outputName,
    ];
  }

  return [
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    outputName,
  ];
};

const VideoConvert: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('cpu');
  const [convertProgress, setConvertProgress] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [ffmpegHint, setFfmpegHint] = useState<string>('');
  const [isStopRequested, setIsStopRequested] = useState(false);
  const stopRequestedRef = useRef(false);
  const webCodecsAbortRef = useRef<AbortController | null>(null);
  const activeCpuFfmpegRef = useRef<FFmpeg | null>(null);
  const webCodecsSupported = useMemo(() => isWebCodecsAvailable(), []);

  const gpuInfo = useMemo(() => getGpuInfo(), []);
  const cpuInfo = useMemo(() => `${navigator.hardwareConcurrency || 'N/A'} 线程`, []);

  const resetResult = () => {
    setOutputBlob(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl('');
    setConvertProgress(0);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error('请导入视频文件');
      return Upload.LIST_IGNORE;
    }

    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    const previewUrl = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreview(previewUrl);
    resetResult();
    return false;
  };

  const handleConvert = async () => {
    if (!sourceFile) {
      message.warning('请先导入视频');
      return;
    }

    setIsConverting(true);
    setIsStopRequested(false);
    stopRequestedRef.current = false;
    webCodecsAbortRef.current = new AbortController();
    setConvertProgress(0);
    setFfmpegHint('');

    try {
      if (deviceMode === 'gpu') {
        if (!webCodecsSupported) {
          throw new Error('当前浏览器不支持 WebCodecs，无法使用 GPU 转换。');
        }
        if (outputFormat !== 'mp4') {
          throw new Error('GPU 模式暂仅支持输出 MP4，请切换为 MP4 格式。');
        }

        setFfmpegHint('GPU 模式已启用：当前使用 WebCodecs 编码管线（实验性）。');
        const gpuBlob = await transcodeWithWebCodecs(sourceFile, {
          format: 'mp4',
          onProgress: (progress) => setConvertProgress(progress),
          signal: webCodecsAbortRef.current.signal,
        });

        const gpuUrl = URL.createObjectURL(gpuBlob);
        setOutputBlob(gpuBlob);
        setOutputUrl(gpuUrl);
        setConvertProgress(100);
        message.success('视频转换完成（GPU 模式）');
        return;
      }

      setFfmpegHint('CPU 模式：使用 FFmpeg.wasm 在本地执行转换。');
      const ffmpeg: FFmpeg = await initFFmpeg((progress) => {
        setConvertProgress(Math.max(1, Math.round(progress)));
      });
      activeCpuFfmpegRef.current = ffmpeg;

      const inputExt = sourceFile.name.split('.').pop() || 'mp4';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(sourceFile));
      await ffmpeg.exec(buildCommandArgs(inputName, outputName, outputFormat));

      if (stopRequestedRef.current) {
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
          console.warn('Cleanup after stop failed:', cleanupError);
        }
        throw new Error('Conversion stopped by user.');
      }

      const outputData = await ffmpeg.readFile(outputName);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const blob = outputData instanceof Uint8Array
        ? new Blob([outputData.buffer as ArrayBuffer], { type: `video/${outputFormat}` })
        : new Blob([outputData], { type: `video/${outputFormat}` });

      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setConvertProgress(100);
      message.success('视频转换完成');
    } catch (error) {
      console.error(error);
      if (stopRequestedRef.current || (error instanceof Error && error.message.includes('stopped by user'))) {
        message.warning('已停止转换');
      } else {
        message.error('视频转换失败，请重试');
      }
    } finally {
      activeCpuFfmpegRef.current = null;
      setIsConverting(false);
      setIsStopRequested(false);
      stopRequestedRef.current = false;
      webCodecsAbortRef.current = null;
    }
  };

  const handleStopConvert = () => {
    if (!isConverting) return;
    setIsStopRequested(true);
    stopRequestedRef.current = true;
    webCodecsAbortRef.current?.abort();
    if (activeCpuFfmpegRef.current) {
      terminateFFmpegInstance();
    }
    setFfmpegHint('已取消当前转换任务。');
  };

  return (
    <Wrapper>
      <DeviceCard title="处理设备">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>CPU：{cpuInfo}</Text>
          <Text>GPU：{gpuInfo || '未检测到可用 WebGL GPU 信息'}</Text>
          <Radio.Group value={deviceMode} onChange={(e) => setDeviceMode(e.target.value)}>
            <Radio value="cpu">使用 CPU</Radio>
            <Radio value="gpu" disabled={!gpuInfo || !webCodecsSupported}>使用 GPU（WebCodecs）</Radio>
          </Radio.Group>
          {!webCodecsSupported && (
            <Alert type="warning" showIcon message="当前浏览器不支持 WebCodecs，GPU 模式不可用。" />
          )}
          {ffmpegHint && <Alert type="info" showIcon message={ffmpegHint} />}
        </Space>
      </DeviceCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <ConvertCard title="导入视频（拖拽或点击）">
            <Dragger
              multiple={false}
              accept="video/*"
              beforeUpload={handleFileSelect}
              showUploadList={false}
              disabled={isConverting}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p>拖拽视频到这里，或点击上传</p>
            </Dragger>
            {sourceFile && (
              <Paragraph style={{ marginTop: 12 }}>
                <Text strong>{sourceFile.name}</Text><br />
                <Text type="secondary">大小：{formatSize(sourceFile.size)}</Text>
              </Paragraph>
            )}
          </ConvertCard>
        </Col>

        <Col xs={24} lg={8}>
          <ConvertCard title="转换设置">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>目标格式</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={outputFormat}
                  options={SUPPORTED_FORMATS}
                  onChange={(value) => setOutputFormat(value)}
                  disabled={isConverting}
                />
              </div>

              <Button
                type="primary"
                icon={<RetweetOutlined />}
                loading={isConverting}
                disabled={!sourceFile}
                onClick={handleConvert}
                block
              >
                开始转换
              </Button>

              <Button
                danger
                icon={<StopOutlined />}
                disabled={!isConverting || isStopRequested}
                onClick={handleStopConvert}
                block
              >
                停止转换
              </Button>

              <Button
                icon={<ReloadOutlined />}
                disabled={isConverting}
                onClick={() => {
                  if (sourcePreview) URL.revokeObjectURL(sourcePreview);
                  resetResult();
                  setSourceFile(null);
                  setSourcePreview('');
                }}
                block
              >
                重置
              </Button>
            </Space>
          </ConvertCard>
        </Col>

        <Col xs={24} lg={8}>
          <ConvertCard title="导出结果">
            <Space direction="vertical" style={{ width: '100%' }}>
              {isConverting && (
                <>
                  <Text>导出进度</Text>
                  <Progress percent={convertProgress} status="active" />
                </>
              )}

              {!isConverting && outputBlob && outputUrl && (
                <>
                  <ResultPreview controls src={outputUrl} />
                  <Text type="secondary">导出大小：{formatSize(outputBlob.size)}</Text>
                  <a href={outputUrl} download={`converted-${Date.now()}.${outputFormat}`}>
                    <Button type="primary" icon={<DownloadOutlined />} block>
                      下载导出文件
                    </Button>
                  </a>
                </>
              )}

              {!isConverting && !outputBlob && (
                <Text type="secondary">转换完成后可在此预览并导出文件。</Text>
              )}
            </Space>
          </ConvertCard>
        </Col>
      </Row>
    </Wrapper>
  );
};

export default VideoConvert;

