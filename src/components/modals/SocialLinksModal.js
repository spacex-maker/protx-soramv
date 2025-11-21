import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const platformConfigs = {
  github: {
    name: 'GitHub',
    icon: 'bi-github',
    color: '#ffffff'
  },
  twitter: {
    name: 'Twitter',
    icon: 'bi-twitter-x',
    color: '#1DA1F2'
  },
  discord: {
    name: 'Discord',
    icon: 'bi-discord',
    color: '#5865F2'
  },
  youtube: {
    name: 'YouTube',
    icon: 'bi-youtube',
    color: '#FF0000'
  },
  bilibili: {
    name: 'Bilibili',
    icon: 'bi-play-circle',
    color: '#00A1D6'
  },
  weibo: {
    name: '微博',
    icon: 'bi-sina-weibo',
    color: '#E6162D'
  },
  instagram: {
    name: 'Instagram',
    icon: 'bi-instagram',
    color: '#E4405F'
  },
  facebook: {
    name: 'Facebook',
    icon: 'bi-facebook',
    color: '#1877F2'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'bi-linkedin',
    color: '#0A66C2'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'bi-tiktok',
    color: '#000000'
  },
  telegram: {
    name: 'Telegram',
    icon: 'bi-telegram',
    color: '#26A5E4'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'bi-whatsapp',
    color: '#25D366'
  },
  reddit: {
    name: 'Reddit',
    icon: 'bi-reddit',
    color: '#FF4500'
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'bi-pinterest',
    color: '#E60023'
  },
  medium: {
    name: 'Medium',
    icon: 'bi-medium',
    color: '#000000'
  },
  twitch: {
    name: 'Twitch',
    icon: 'bi-twitch',
    color: '#9146FF'
  },
  spotify: {
    name: 'Spotify',
    icon: 'bi-spotify',
    color: '#1DB954'
  },
  snapchat: {
    name: 'Snapchat',
    icon: 'bi-snapchat',
    color: '#FFFC00'
  },
  wechat: {
    name: '微信',
    icon: 'bi-wechat',
    color: '#07C160'
  },
  qq: {
    name: 'QQ',
    icon: 'bi-tencent-qq',
    color: '#12B7F5'
  },
  douyin: {
    name: '抖音',
    icon: 'bi-tiktok',
    color: '#000000'
  },
  xiaohongshu: {
    name: '小红书',
    icon: 'bi-book',
    color: '#FE2C55'
  },
  zhihu: {
    name: '知乎',
    icon: 'bi-zhihu',
    color: '#0084FF'
  }
};

const ModalOverlay = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center`}
  backdrop-filter: blur(5px);
`;

const ModalDialog = styled.div`
  ${tw`w-full max-w-md mx-4`}
`;

const ModalContent = styled.div`
  ${tw`relative rounded-2xl`}
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  ${tw`flex items-center justify-between p-6`}
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h5`
  ${tw`text-xl text-white flex items-center gap-2 m-0`}
`;

const CloseButton = styled.button`
  ${tw`text-white opacity-75 hover:opacity-100 transition-opacity`}
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 0;
  cursor: pointer;
`;

const ModalBody = styled.div`
  ${tw`p-6`}
`;

const SocialLinks = styled.div`
  ${tw`flex flex-col gap-4`}
`;

const SocialIcon = styled.div`
  ${tw`w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0 relative`}
  background: rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
  perspective: 1000px;
  z-index: 2;
  
  i {
    transition: all 0.5s ease;
    transform-style: preserve-3d;
    backface-visibility: visible;
    transform-origin: center center;
    color: ${props => {
      const platform = props.className?.split(' ')[0];
      return platformConfigs[platform]?.color || '#FFFFFF';
    }};
  }
`;

const ExternalIcon = styled.i`
  ${tw`text-xl opacity-50 transition-all duration-300`}
  z-index: 2;
`;

const SocialLink = styled.a`
  ${tw`flex items-center gap-4 p-4 rounded-xl text-white no-underline relative`}
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
  perspective: 1000px;
  cursor: pointer;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: ${props => {
      const platform = props.className?.split(' ')[0];
      return platformConfigs[platform]?.color || '#FFFFFF';
    }};
    opacity: 0;
    filter: blur(8px);
    z-index: -2;
    transition: opacity 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at var(--x, 50%) var(--y, 50%),
      ${props => {
        const platform = props.className?.split(' ')[0];
        const color = platformConfigs[platform]?.color || '#FFFFFF';
        return `${color}40`;
      }} 0%,
      transparent 70%
    );
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px) scale(1.02);
    border-color: ${props => {
      const platform = props.className?.split(' ')[0];
      return platformConfigs[platform]?.color || '#FFFFFF';
    }};
    box-shadow: 0 0 20px ${props => {
      const platform = props.className?.split(' ')[0];
      const color = platformConfigs[platform]?.color || '#FFFFFF';
      return `${color}40`;
    }};

    &::before {
      opacity: 1;
    }

    &::after {
      opacity: 1;
    }

    ${SocialIcon} {
      background: rgba(255, 255, 255, 0.2);
      
      i {
        animation: iconRotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        will-change: transform;
      }
    }

    ${ExternalIcon} {
      transform: translate(2px, -2px);
      opacity: 1;
    }
  }
`;

const SocialInfo = styled.div`
  ${tw`flex-1 flex flex-col gap-1`}
`;

const PlatformName = styled.span`
  ${tw`text-lg font-medium`}
`;

const Username = styled.span`
  ${tw`text-sm opacity-50`}
`;

const SocialLinksModal = ({ show, onClose, websiteName, socialLinks }) => {
  console.log('SocialLinksModal 渲染:', { show, websiteName, socialLinks });

  if (!show) return null;

  const handleMouseMove = (e) => {
    const link = e.currentTarget;
    const rect = link.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    link.style.setProperty('--x', `${x}%`);
    link.style.setProperty('--y', `${y}%`);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalDialog onClick={e => e.stopPropagation()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <i className="bi bi-share"></i>
              关注 {websiteName}
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <SocialLinks>
              {socialLinks && Object.entries(socialLinks).map(([platform, url]) => {
                console.log('渲染社交链接:', { platform, url });
                const config = platformConfigs[platform] || {
                  icon: 'bi-link',
                  name: platform,
                  color: '#FFFFFF'
                };
                const username = url.split('/').pop();

                return (
                  <SocialLink 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={platform}
                    onMouseMove={handleMouseMove}
                  >
                    <SocialIcon className={platform}>
                      <i className={`bi ${config.icon}`} />
                    </SocialIcon>
                    <SocialInfo>
                      <PlatformName>{config.name}</PlatformName>
                      <Username>@{username}</Username>
                    </SocialInfo>
                    <ExternalIcon className="bi bi-box-arrow-up-right" />
                  </SocialLink>
                );
              })}
            </SocialLinks>
          </ModalBody>
        </ModalContent>
      </ModalDialog>
    </ModalOverlay>
  );
};

export default SocialLinksModal; 