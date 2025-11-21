import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FormattedMessage } from 'react-intl';

const flowAnimation = keyframes`
  0% {
    stroke-dashoffset: 1000;
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.2;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const progressAnimation = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const DiagramContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.05), rgba(22, 119, 255, 0.05));
  border-radius: 16px;
  padding: 24px;
  position: relative;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: auto;
  
  .flow-path {
    fill: none;
    stroke: #52c41a;
    stroke-width: 2;
    stroke-dasharray: 10;
    animation: ${flowAnimation} 10s linear infinite;
  }
  
  .block {
    fill: #e6f7ff;
    stroke: #1890ff;
    stroke-width: 2;
    rx: 6;
    animation: ${pulseAnimation} 3s ease-in-out infinite;
  }
  
  .progress-bar {
    fill: #52c41a;
    animation: ${progressAnimation} 4s ease-in-out infinite;
  }
  
  .text {
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    fill: #666;
  }
  
  .title {
    font-size: 14px;
    font-weight: bold;
    fill: #333;
  }
`;

const ChunkDecryptDiagram = () => {
  return (
    <DiagramContainer>
      <SVGContainer viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* 标题 */}
        <text x="400" y="40" className="title" textAnchor="middle">
          <FormattedMessage id="decrypt.diagram.title" defaultMessage="智能分块解密流程" />
        </text>
        
        {/* 原始加密文件 */}
        <rect x="50" y="80" width="200" height="60" className="block" />
        <text x="150" y="115" className="text" textAnchor="middle">
          <FormattedMessage id="decrypt.diagram.encryptedFile" defaultMessage="加密文件" />
        </text>
        
        {/* 分块过程 */}
        <g transform="translate(300, 80)">
          <rect x="0" y="0" width="40" height="60" className="block" />
          <rect x="50" y="0" width="40" height="60" className="block" />
          <rect x="100" y="0" width="40" height="60" className="block" />
          <text x="70" y="-10" className="text" textAnchor="middle">
            <FormattedMessage id="decrypt.diagram.smartChunking" defaultMessage="智能分块" />
          </text>
        </g>
        
        {/* 并行解密过程 */}
        <g transform="translate(500, 80)">
          <rect x="0" y="0" width="40" height="60" className="block" style={{fill: '#f6ffed'}} />
          <rect x="50" y="0" width="40" height="60" className="block" style={{fill: '#f6ffed'}} />
          <rect x="100" y="0" width="40" height="60" className="block" style={{fill: '#f6ffed'}} />
          <text x="70" y="-10" className="text" textAnchor="middle">
            <FormattedMessage id="decrypt.diagram.parallelDecryption" defaultMessage="并行解密" />
          </text>
        </g>
        
        {/* 解密后文件 */}
        <rect x="700" y="80" width="50" height="60" className="block" style={{fill: '#f6ffed'}} />
        <text x="725" y="115" className="text" textAnchor="middle">
          <FormattedMessage id="decrypt.diagram.decryptedFile" defaultMessage="解密文件" />
        </text>
        
        {/* 流动路径 */}
        <path d="M 250 110 C 280 110, 290 110, 300 110" className="flow-path" />
        <path d="M 440 110 C 470 110, 480 110, 500 110" className="flow-path" />
        <path d="M 640 110 C 670 110, 680 110, 700 110" className="flow-path" />
        
        {/* 内存使用图表 */}
        <g transform="translate(50, 200)">
          <rect x="0" y="0" width="700" height="80" fill="#f0f0f0" rx="4" />
          <text x="350" y="-10" className="text" textAnchor="middle">
            <FormattedMessage id="decrypt.diagram.memoryOptimization" defaultMessage="内存使用优化" />
          </text>
          <rect x="20" y="20" width="660" height="20" fill="#e6f7ff" rx="2" />
          <rect x="20" y="20" width="66" height="20" className="progress-bar" rx="2" />
          <text x="350" y="65" className="text" textAnchor="middle">
            <FormattedMessage id="decrypt.diagram.memoryUsage" defaultMessage="仅占用约10%内存空间" />
          </text>
        </g>
        
        {/* 进度指示器 */}
        <g transform="translate(50, 320)">
          <rect x="0" y="0" width="700" height="40" fill="#f0f0f0" rx="4" />
          <rect x="20" y="10" width="660" height="20" fill="#e6f7ff" rx="2" />
          <rect x="20" y="10" width="330" height="20" className="progress-bar" rx="2" />
          <text x="350" y="-10" className="text" textAnchor="middle">
            <FormattedMessage id="decrypt.diagram.realTimeFeedback" defaultMessage="实时进度反馈" />
          </text>
        </g>
      </SVGContainer>
    </DiagramContainer>
  );
};

export default ChunkDecryptDiagram; 