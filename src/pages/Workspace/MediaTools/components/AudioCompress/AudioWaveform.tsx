import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';

interface AudioWaveformProps {
  audioUrl: string;
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  backgroundColor?: string;
}

const WaveformContainer = styled.div<{ $height: number }>`
  position: relative;
  width: 100%;
  height: ${props => props.$height}px;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  width,
  height = 120,
  barWidth = 2,
  gap = 1,
  color,
  backgroundColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const theme = useTheme() as any;

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        
        // 创建 AudioContext
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // 获取音频文件
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // 解码音频数据
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;

        // 获取音频数据
        const channelData = audioBuffer.getChannelData(0); // 使用第一个声道

        // 设置 canvas 尺寸
        const containerWidth = canvas.parentElement?.clientWidth || width || 800;
        canvas.width = containerWidth;
        canvas.height = height;

        // 计算柱子数量
        const bars = Math.floor(containerWidth / (barWidth + gap));

        // 计算每个柱子的数据范围
        const dataPoints: number[] = [];
        for (let i = 0; i < bars; i++) {
          const start = Math.floor((i * channelData.length) / bars);
          const end = Math.floor(((i + 1) * channelData.length) / bars);
          
          let sum = 0;
          let max = 0;
          for (let j = start; j < end; j++) {
            const abs = Math.abs(channelData[j]);
            sum += abs;
            max = Math.max(max, abs);
          }
          // 使用 RMS (均方根) 和峰值平均来获得更好的视觉效果
          const rms = Math.sqrt(sum / (end - start));
          dataPoints.push((rms + max * 0.5) / 1.5);
        }

        // 绘制波形
        const maxAmplitude = Math.max(...dataPoints) || 1;
        const centerY = height / 2;
        const isDark = theme?.mode === 'dark';
        const themeColor = color || (isDark ? '#6366f1' : '#1890ff');

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景（如果需要）
        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 绘制波形
        ctx.fillStyle = themeColor;
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = barWidth;

        dataPoints.forEach((amplitude, index) => {
          const barHeight = (amplitude / maxAmplitude) * (centerY - 10);
          const x = index * (barWidth + gap) + gap / 2;
          
          // 绘制上下对称的柱状图
          ctx.fillRect(x, centerY - barHeight, barWidth, barHeight * 2);
        });

        // 绘制中心线
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load audio waveform:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    // 处理窗口大小变化
    const handleResize = () => {
      if (audioBufferRef.current && canvasRef.current) {
        loadAudio();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [audioUrl, width, height, barWidth, gap, color, backgroundColor, theme?.mode]);

  return (
    <WaveformContainer $height={height}>
      <Canvas ref={canvasRef} />
    </WaveformContainer>
  );
};

export default AudioWaveform;
