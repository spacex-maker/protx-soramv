import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const ModalOverlay = styled.div`
  ${tw`fixed inset-0 z-50`}
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const ModalDialog = styled.div`
  ${tw`w-full max-w-md mx-4`}
`;

const ModalContent = styled.div`
  ${tw`bg-[rgba(33,33,33,0.95)] rounded-2xl border border-white border-opacity-10`}
  backdrop-filter: blur(10px);
`;

const ModalHeader = styled.div`
  ${tw`flex items-center justify-between p-6 border-b border-white border-opacity-10`}
`;

const ModalTitle = styled.h5`
  ${tw`text-xl text-white flex items-center gap-2 m-0`}
`;

const CloseButton = styled.button`
  ${tw`text-white opacity-75 hover:opacity-100 transition-opacity bg-transparent border-0`}
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalBody = styled.div`
  ${tw`p-6`}
`;

const PlatformIcon = styled.div`
  ${tw`w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0 relative`}
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
  z-index: 2;

  i {
    transition: all 0.5s ease;
    transform-style: preserve-3d;
    backface-visibility: visible;
    transform-origin: center center;
  }

  i.android {
    color: #3DDC84;
  }

  i.ios {
    color: #007AFF;
  }

  i.harmony {
    color: #FF0000;
  }
`;

const PlatformInfo = styled.div`
  ${tw`flex-1 flex flex-col gap-1 relative`}
  z-index: 2;
  cursor: inherit;
`;

const PlatformName = styled.span`
  ${tw`text-lg font-medium`}
`;

const PlatformDesc = styled.span`
  ${tw`text-sm opacity-50`}
  
  button:disabled & {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ChevronIcon = styled.i`
  ${tw`text-xl opacity-50 transition-all duration-300 relative`}
  z-index: 2;
  cursor: inherit;
`;

const iconAnimation = `
  @keyframes iconRotate {
    0% { 
      transform: rotateY(0deg) scale(1) translateZ(0);
      filter: brightness(1);
    }
    50% { 
      transform: rotateY(180deg) scale(1.2) translateZ(20px);
      filter: brightness(1.5);
    }
    100% { 
      transform: rotateY(360deg) scale(1) translateZ(0);
      filter: brightness(1);
    }
  }

  @keyframes glowPulse {
    0% { opacity: 0.3; filter: blur(8px); }
    50% { opacity: 0.6; filter: blur(12px); }
    100% { opacity: 0.3; filter: blur(8px); }
  }

  @keyframes hoverGlow {
    0% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.6; transform: scale(1); }
  }
`;

const DownloadButton = styled.button`
  ${tw`flex items-center gap-4 w-full p-4 text-left text-white transition-all duration-300 rounded-xl relative overflow-hidden`}
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
  perspective: 1000px;
  cursor: pointer;

  ${iconAnimation}

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: ${props => getPlatformColor(props.className)};
    opacity: 0;
    filter: blur(8px);
    z-index: -2;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at var(--x, 50%) var(--y, 50%),
      ${props => {
        const color = getPlatformColor(props.className);
        return `${color}40`;
      }} 0%,
      transparent 70%
    );
    opacity: 0;
    z-index: -1;
  }

  &:disabled {
    opacity: 0.5;
    background: rgba(255, 255, 255, 0.05);
    transform: none;
    cursor: not-allowed;

    ${PlatformIcon} {
      opacity: 0.5;
    }

    ${ChevronIcon} {
      opacity: 0.3;
    }

    ${PlatformDesc} {
      color: rgba(255, 255, 255, 0.5);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        animation: disabledGlow 2s ease-in-out infinite;
      }

      &::after {
        opacity: 1;
        animation: glowPulse 2s ease-in-out infinite;
      }

      ${PlatformIcon} {
        background: rgba(255, 255, 255, 0.15);
        transition: background 0.3s ease;
      }
    }
  }

  &:not(:disabled) {
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px) scale(1.02);
      border-color: ${props => getPlatformColor(props.className)};
      box-shadow: 0 0 20px ${props => {
        const color = getPlatformColor(props.className);
        return `${color}40`;
      }};

      &::before {
        opacity: 1;
        animation: glowPulse 2s ease-in-out infinite;
      }

      &::after {
        opacity: 1;
        animation: hoverGlow 2s ease-in-out infinite;
      }

      ${PlatformIcon} {
        background: rgba(255, 255, 255, 0.2);
        
        i {
          animation: iconRotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform;
        }
      }

      ${ChevronIcon} {
        transform: translateX(6px);
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }
`;

const DownloadOptions = styled.div`
  ${tw`flex flex-col gap-4`}
  
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
`;

const getPlatformColor = (className) => {
  if (className?.includes('android-button')) return '#3DDC84';
  if (className?.includes('ios-button')) return '#007AFF';
  if (className?.includes('harmony-button')) return '#FF0000';
  return '#FFFFFF';
};

const AppDownloadModal = ({ show, onClose, urls }) => {
  if (!show) return null;

  const { androidUrl, iosUrl, harmonyUrl } = urls || {};

  const handleDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
      onClose();
    }
  };

  const handleMouseMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', `${x}%`);
    btn.style.setProperty('--y', `${y}%`);
  };

  // 添加控制台日志来调试
  console.log('Modal props:', { show, urls });

  return (
    <ModalOverlay show={show} onClick={onClose}>
      <ModalDialog onClick={e => e.stopPropagation()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <i className="bi bi-download"></i>
              选择下载版本
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <DownloadOptions>
              <DownloadButton
                className="android-button"
                disabled={!androidUrl}
                onClick={() => handleDownload(androidUrl)}
                onMouseMove={handleMouseMove}
              >
                <div className="particles"></div>
                <PlatformIcon>
                  <i className="bi bi-android2 android"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>Android 版本</PlatformName>
                  <PlatformDesc>适用于各品牌安卓设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>

              <DownloadButton
                className="ios-button"
                disabled={!iosUrl}
                onClick={() => handleDownload(iosUrl)}
                onMouseMove={handleMouseMove}
              >
                <div className="particles"></div>
                <PlatformIcon>
                  <i className="bi bi-apple ios"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>iOS 版本</PlatformName>
                  <PlatformDesc>适用于 iPhone 和 iPad 设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>

              <DownloadButton
                className="harmony-button"
                disabled={!harmonyUrl}
                onClick={() => handleDownload(harmonyUrl)}
                onMouseMove={handleMouseMove}
              >
                <div className="particles"></div>
                <PlatformIcon>
                  <i className="bi bi-hexagon harmony"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>HarmonyOS 版本</PlatformName>
                  <PlatformDesc>适用于华为鸿蒙系统设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>
            </DownloadOptions>
          </ModalBody>
        </ModalContent>
      </ModalDialog>
    </ModalOverlay>
  );
};

export default AppDownloadModal; 