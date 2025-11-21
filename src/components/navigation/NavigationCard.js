import React, { useState } from 'react';
import tw from "twin.macro";
import styled, { keyframes } from "styled-components";
import SocialLinksModal from "../modals/SocialLinksModal";
import AppDownloadModal from "../modals/AppDownloadModal";

// 添加 shine 动画定义
const shine = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

// 卡片基础样式
const Card = styled.div`
  ${tw`mb-8`}
  opacity: 0;
  transform: translateY(20px);
  animation: cardFadeIn 0.6s ease-out forwards;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardInner = styled.div`
  ${tw`p-6 rounded-xl`}
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// 卡片头部样式
const CardHeader = tw.div`flex items-center mb-5`;
const CardIcon = styled.div`
  ${tw`w-[50px] h-[50px] rounded-full flex items-center justify-center mr-4`}
  background: rgba(255, 255, 255, 0.1);
  
  i {
    ${tw`text-2xl`}
    color: #4CAF50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  }
`;

const CardTitle = styled.h3`
  ${tw`text-2xl font-semibold m-0`}
  background: linear-gradient(45deg, #66BB6A, #4CAF50, #43A047, #388E3C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 子分类容器样式
const SubcategoriesContainer = styled.div`
  ${tw`mt-5 grid`}
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// 子分类样式
const Subcategory = styled.div`
  ${tw`mb-6 w-full`}
  min-width: 400px;
  
  @media (max-width: 992px) {
    min-width: 100%;
  }
`;

const SubcategoryTitle = styled.h4`
  ${tw`text-lg pb-3 mb-4 flex items-center`}
  background: linear-gradient(45deg, #4CAF50, #66BB6A, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  i {
    ${tw`mr-2 text-[0.9em]`}
    background: inherit;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

// 网站列表项样式
const SiteItem = styled.div`
  ${tw`flex p-4 mb-4 rounded-xl relative transition-all duration-300`}
  gap: 16px;
  background: rgba(90, 90, 90, 0.45);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 0;

  &:hover {
    ${tw`transform -translate-y-1`}
    background: rgba(100, 100, 100, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    background: radial-gradient(
      800px circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 255, 255, 0.06),
      transparent 40%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }
`;

// 网站图标样式
const SiteIcon = styled.div`
  ${tw`w-[70px] h-[70px] flex-shrink-0`}
  
  img {
    ${tw`w-full h-full rounded-xl object-cover`}
  }
`;

// 网站内容区域样式
const SiteContent = styled.div`
  ${tw`flex min-h-[70px] flex-1`}
  width: 0;
  min-width: 0;
`;

const SiteInfo = styled.div`
  ${tw`flex flex-col min-w-0 w-full`}
`;

const SiteName = styled.h5`
  ${tw`text-lg font-medium text-white mb-2 leading-tight`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
`;

const SiteDesc = styled.p`
  ${tw`text-sm text-gray-300 mb-3 flex-1`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  min-height: calc(1.5em * 2);
  height: calc(1.5em * 2);
`;

// 按钮组样式
const SiteActions = styled.div`
  ${tw`flex mt-auto`}
  gap: 10px;
`;

const ActionButton = styled.button`
  ${tw`flex items-center px-4 text-sm rounded-lg h-8 border-none`}
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  gap: 6px;
`;

const WebsiteButton = styled(ActionButton)`
  ${tw`text-white`}
  background: rgba(255, 255, 255, 0.1);
`;

const AppButton = styled(ActionButton)`
  ${tw`text-white`}
  background: linear-gradient(45deg, #4CAF50, #45a049);
`;

// 添加 SocialButton 样式定义
const SocialButton = styled(ActionButton)`
  ${tw`text-white`}
  position: relative;
  background: linear-gradient(
    90deg,
    #FFD700,
    #FFA500,
    #66BB6A,
    #4CAF50,
    #FFD700
  );
  background-size: 200% auto;
  animation: ${shine} 5s linear infinite;
  border: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 检测设备类型的函数
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/harmonyos/i.test(userAgent)) {
    return 'harmony';
  } else if (/android/i.test(userAgent)) {
    return 'android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    return 'ios';
  } else {
    return 'desktop';
  }
};

// 自定义模态框组件
const ModalOverlay = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
`;

const ModalContent = styled.div`
  ${tw`bg-white rounded-lg shadow-xl relative`}
  max-width: 500px;
  width: 90%;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 0;
`;

const CustomModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

// 创建一个新的包装组件
const FollowButtonWrapper = styled.div`
  display: inline-block;
`;

const FollowButton = styled.button.attrs({
  className: 'follow-btn' // 添加一个唯一的类名
})`
  ${tw`px-3 py-1 rounded text-sm transition-all duration-300`}
  position: relative;
  z-index: 1;
  color: white;
  border: none;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    background: linear-gradient(
      90deg,
      #FFD700,
      #FFA500,
      #66BB6A,
      #4CAF50,
      #FFD700
    );
    background-size: 200% auto;
    animation: ${shine} 5s linear infinite;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NavigationCard = ({ category, subCategories }) => {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [currentAppUrls, setCurrentAppUrls] = useState({});
  const [socialModalData, setSocialModalData] = useState({
    websiteName: '',
    socialLinks: {}
  });

  // 获取分类图标
  const getCategoryIcon = (category) => {
    const icons = {
      '交通': 'bi-car-front',
      '购物': 'bi-cart',
      '生活': 'bi-house-heart',
      '行政服务': 'bi-building',
    };
    return icons[category] || 'bi-grid';
  };

  // 处理 APP 下载的函数
  const showAppDownloadOptions = (androidUrl, iosUrl, harmonyUrl) => {
    console.log('showAppDownloadOptions 被调用:', { androidUrl, iosUrl, harmonyUrl });
    
    const deviceType = detectDevice();
    
    // 根据设备类型直接跳转
    if (deviceType === 'harmony' && harmonyUrl) {
      window.open(harmonyUrl, '_blank');
      return;
    }
    if (deviceType === 'android' && androidUrl) {
      window.open(androidUrl, '_blank');
      return;
    }
    if (deviceType === 'ios' && iosUrl) {
      window.open(iosUrl, '_blank');
      return;
    }
    
    // 桌面设备显示模态框
    if (deviceType === 'desktop') {
      setCurrentAppUrls({
        androidUrl,
        iosUrl,
        harmonyUrl
      });
      setIsAppModalOpen(true);
    }
  };

  // 处理社交媒体链接的函数
  const showSocialLinks = (websiteName, socialLinksStr) => {
    console.log('showSocialLinks 被调用:', { websiteName, socialLinksStr });
    
    try {
      // 如果是字符串就解析，否则直接使用对象
      const socialLinks = typeof socialLinksStr === 'string' ? 
        JSON.parse(socialLinksStr) : 
        socialLinksStr;
      
      console.log('解析后的 socialLinks:', socialLinks);
      
      // 直接设置状态
      setIsSocialModalOpen(true);
      setSocialModalData({
        websiteName,
        socialLinks
      });
      
    } catch (error) {
      console.error('解析社交媒体链接失败:', error);
    }
  };

  // 渲染 APP 下载模态框内容
  const renderAppModalContent = () => (
    <div className="download-options">
      <button 
        className="btn btn-download-option" 
        onClick={() => {
          window.open(currentAppUrls.androidUrl, '_blank');
          setIsAppModalOpen(false);
        }}
        disabled={!currentAppUrls.androidUrl}
      >
        <div className="platform-icon">
          <i className="bi bi-android2"></i>
        </div>
        <div className="platform-info">
          <span className="platform-name">Android 版本</span>
          <span className="platform-desc">适用于各品牌安卓设备</span>
        </div>
        <i className="bi bi-chevron-right"></i>
      </button>
      {/* 其他下载按钮类似 */}
    </div>
  );

  // 渲染社交媒体模态框内容
  const renderSocialModalContent = () => {
    const platformConfigs = {
      weibo: {
        icon: 'bi-sina-weibo',
        color: '#ffffff',
        gradient: 'linear-gradient(45deg, #ff8200, #ff0000)',
        shadowColor: 'rgba(255, 130, 0, 0.2)'
      },
      // ... 其他平台配置
    };

    return (
      <div className="social-links-container">
        {Object.entries(socialModalData.socialLinks || {}).map(([platform, url]) => {
          const config = platformConfigs[platform] || {
            icon: 'bi-link',
            color: '#ffffff',
            gradient: 'linear-gradient(45deg, #666666, #444444)',
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          };
          
          const username = url.split('/').pop();
          return (
            <a 
              key={platform}
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`social-link-item social-${platform}`}
            >
              {/* 社交媒体链接内容 */}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardInner>
          <CardHeader>
            <CardIcon>
              <i className={`bi ${getCategoryIcon(category)}`}></i>
            </CardIcon>
            <CardTitle>{category}</CardTitle>
          </CardHeader>

          <SubcategoriesContainer>
            {Object.entries(subCategories).map(([subCategory, websites]) => (
              <Subcategory key={subCategory}>
                <SubcategoryTitle>
                  <i className="bi bi-chevron-right"></i>
                  {subCategory}
                </SubcategoryTitle>

                <div>
                  {websites.map((website, index) => (
                    <SiteItem key={index}>
                      <SiteIcon>
                        {website.logoUrl ? (
                          <img src={website.logoUrl} alt={website.name} />
                        ) : (
                          <i className="bi bi-link-45deg"></i>
                        )}
                      </SiteIcon>

                      <SiteContent>
                        <SiteInfo>
                          <SiteName>{website.name}</SiteName>
                          <SiteDesc>{website.description}</SiteDesc>
                          <SiteActions>
                            <WebsiteButton onClick={() => window.open(website.url, '_blank')}>
                              <i className="bi bi-globe"></i>
                              官网
                            </WebsiteButton>
                            
                            {(website.androidAppUrl || website.iosAppUrl || website.harmonyOSAppUrl) && (
                              <AppButton 
                                onClick={() => showAppDownloadOptions(
                                  website.androidAppUrl,
                                  website.iosAppUrl,
                                  website.harmonyOSAppUrl
                                )}
                              >
                                <i className="bi bi-download"></i>
                                APP
                              </AppButton>
                            )}
                            
                            {website.socialLinks && (
                              <SocialButton 
                                onClick={() => {
                                  console.log('点击社交按钮:', website.name, website.socialLinks);
                                  showSocialLinks(website.name, website.socialLinks);
                                }}
                              >
                                <i className="bi bi-share"></i>
                                关注
                              </SocialButton>
                            )}
                          </SiteActions>
                        </SiteInfo>
                      </SiteContent>
                    </SiteItem>
                  ))}
                </div>
              </Subcategory>
            ))}
          </SubcategoriesContainer>
        </CardInner>
      </Card>

      {/* APP 下载模态框 */}
      {isAppModalOpen && (
        <AppDownloadModal
          show={isAppModalOpen}
          onClose={() => {
            setIsAppModalOpen(false);
            setCurrentAppUrls({});
          }}
          urls={currentAppUrls}
        />
      )}

      {/* 社交媒体模态框 */}
      {isSocialModalOpen && (
        <SocialLinksModal
          show={isSocialModalOpen}
          onClose={() => {
            setIsSocialModalOpen(false);
            setSocialModalData({ websiteName: '', socialLinks: {} });
          }}
          websiteName={socialModalData.websiteName}
          socialLinks={socialModalData.socialLinks}
        />
      )}
    </>
  );
};

export default NavigationCard; 