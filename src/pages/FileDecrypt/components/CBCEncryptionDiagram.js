import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useIntl } from 'react-intl';

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
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const DiagramContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.05), rgba(22, 119, 255, 0.05));
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SVGWrapper = styled.div`
  width: 100%;
  overflow: visible;
  
  svg {
    width: 100%;
    height: auto;
  }

  .flow-path {
    stroke: rgba(82, 196, 26, 0.6);
    stroke-width: 2;
    stroke-dasharray: 10;
    fill: none;
    animation: ${flowAnimation} 3s linear infinite;
  }

  .block {
    fill: white;
    stroke: #1677ff;
    stroke-width: 2;
    animation: ${pulseAnimation} 2s ease-in-out infinite;
  }

  .operation {
    fill: rgba(82, 196, 26, 0.1);
    stroke: #52c41a;
    stroke-width: 2;
  }

  .text {
    font-size: 12px;
    font-family: 'Courier New', monospace;
    fill: var(--ant-color-text);
  }

  .key {
    fill: #faad14;
    stroke: #d48806;
    stroke-width: 2;
  }

  .iv {
    fill: #13c2c2;
    stroke: #08979c;
    stroke-width: 2;
  }
`;

const CBCEncryptionDiagram = () => {
  const intl = useIntl();

  return (
    <DiagramContainer>
      <SVGWrapper>
        <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          {/* 初始化向量 (IV) */}
          <rect x="50" y="50" width="100" height="60" rx="8" className="iv" />
          <text x="100" y="85" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.iv' })}
          </text>

          {/* 明文块 */}
          <rect x="50" y="160" width="100" height="60" rx="8" className="block" />
          <text x="100" y="195" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.plaintext.block1' })}
          </text>

          {/* XOR 操作 */}
          <circle cx="200" y="190" r="25" className="operation" />
          <text x="200" y="195" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.xor.operation' })}
          </text>

          {/* 加密密钥 */}
          <rect x="250" y="50" width="100" height="60" rx="8" className="key" />
          <text x="300" y="85" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.key' })}
          </text>

          {/* AES 加密 */}
          <rect x="250" y="160" width="100" height="60" rx="8" className="operation" />
          <text x="300" y="195" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.aes.encryption' })}
          </text>

          {/* 密文块 1 */}
          <rect x="400" y="160" width="100" height="60" rx="8" className="block" />
          <text x="450" y="195" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.ciphertext.block1' })}
          </text>

          {/* 明文块 2 */}
          <rect x="50" y="280" width="100" height="60" rx="8" className="block" />
          <text x="100" y="315" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.plaintext.block2' })}
          </text>

          {/* XOR 操作 2 */}
          <circle cx="200" y="310" r="25" className="operation" />
          <text x="200" y="315" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.xor.operation' })}
          </text>

          {/* AES 加密 2 */}
          <rect x="250" y="280" width="100" height="60" rx="8" className="operation" />
          <text x="300" y="315" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.aes.encryption' })}
          </text>

          {/* 密文块 2 */}
          <rect x="400" y="280" width="100" height="60" rx="8" className="block" />
          <text x="450" y="315" className="text" textAnchor="middle">
            {intl.formatMessage({ id: 'security.diagram.ciphertext.block2' })}
          </text>

          {/* 连接线 */}
          <path d="M 150 80 L 200 190" className="flow-path" />
          <path d="M 150 190 L 175 190" className="flow-path" />
          <path d="M 225 190 L 250 190" className="flow-path" />
          <path d="M 300 110 L 300 160" className="flow-path" />
          <path d="M 350 190 L 400 190" className="flow-path" />
          <path d="M 450 220 L 450 250 L 200 250 L 200 285" className="flow-path" />
          <path d="M 150 310 L 175 310" className="flow-path" />
          <path d="M 225 310 L 250 310" className="flow-path" />
          <path d="M 300 110 L 300 280" className="flow-path" />
          <path d="M 350 310 L 400 310" className="flow-path" />
        </svg>
      </SVGWrapper>
    </DiagramContainer>
  );
};

export default CBCEncryptionDiagram; 