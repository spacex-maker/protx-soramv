import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import tw from "twin.macro";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import AppDownloadModal from "components/modals/AppDownloadModal.js";
import SocialLinksModal from "components/modals/SocialLinksModal.js";
import SearchBar from "../components/navigation/SearchBar.js";
import NavigationCard from "../components/navigation/NavigationCard.js";
import backgroundImage from "../images/pexels-apasaric-3629227.jpg";
import axios from "axios";

// 创建专用的 axios 实例
const webAxios = axios.create({
  baseURL: 'https://admin.anakkix.cn/manage/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 工具函数
const getCountryCodeFromUrl = () => {
  const url = window.location.pathname;
  const matches = url.match(/\/([^\/]+)\/navigation/);
  return matches ? matches[1] : 'ae';
};

const groupNavigationData = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {};
    }
    if (!acc[item.category][item.subCategory]) {
      acc[item.category][item.subCategory] = [];
    }
    acc[item.category][item.subCategory].push(item);
    return acc;
  }, {});
};

// 动画定义
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shine = keyframes`
  0% { background-position: 0 50%; }
  100% { background-position: 200% 50%; }
`;

// 样式定义
const Container = styled.div`
  ${tw`min-h-screen bg-[#252525] flex flex-col`}
  background-image: url(${backgroundImage});
  background-position: center;
  background-size: cover;
  background-attachment: fixed;

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const HeroSection = styled.div`
  ${tw`relative text-center`}
  padding-top: 180px;
  padding-bottom: 100px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding-top: 140px;
    padding-bottom: 80px;
  }
`;

const HeroTitle = styled.h1`
  ${tw`text-5xl font-bold relative inline-block`}
  margin-bottom: 2.5rem;
  
  .hero-text {
    background: linear-gradient(
      90deg,
      #FFD700, #FFA500, #66BB6A, #4CAF50, #FFD700
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shine} 5s linear infinite;
  }

  &::after {
    content: '';
    ${tw`absolute bottom-0 left-0 w-full h-1 rounded-full`}
    background: linear-gradient(90deg, #FFD700, #4CAF50);
    opacity: 0.5;
    bottom: -0.75rem;
  }
`;

const HeroSubtitle = styled.div`
  ${tw`flex items-center justify-center gap-8 text-lg`}
  margin-bottom: 3rem;
`;

const SubtitleItem = styled.div`
  ${tw`flex items-center gap-2 px-4 py-2 rounded-full`}
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  i {
    ${tw`text-xl`}
    color: ${props => props.iconColor || 'white'};
  }
`;

const SearchBookmarkContainer = styled.div`
  ${tw`max-w-4xl mx-auto px-4 flex gap-4 items-center`}
  
  .search-wrapper {
    ${tw`flex-1`}
  }
`;

const BookmarkButton = styled.button`
  ${tw`
    flex items-center gap-2 
    px-6 h-12 rounded-2xl 
    text-white dark:text-gray-100
    transition-all duration-300
  `}
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      #FFD700,
      #FFA500,
      #66BB6A,
      #4CAF50,
      #FFD700
    );
    background-size: 200% auto;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: ${shine} 5s linear infinite;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    
    &::before {
      opacity: 0.15;
    }

    i {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0);
    
    i {
      transform: scale(0.95);
    }
  }

  i, span {
    position: relative;
    z-index: 1;
  }

  i {
    ${tw`text-xl transition-transform duration-300`}
    color: ${props => props.theme.mode === 'dark' ? '#FFD700' : '#FFD700'};
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  span {
    ${tw`text-sm font-medium`}
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

// 添加 MainContent 样式组件
const MainContent = styled.main`
  ${tw`
    flex-1
  `}
  min-height: 60vh;
`;

// 组件定义
const Navigation = () => {
  const [navigationData, setNavigationData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const countryCode = getCountryCodeFromUrl();
        const response = await webAxios.get(`/base/website-list/list`, {
          params: {
            countryCode
          }
        });
        
        if (response.data.success) {
          console.log('获取到的数据:', response.data.data);
          const groupedData = groupNavigationData(response.data.data);
          console.log('分组后的数据:', groupedData);
          setNavigationData(groupedData);
        } else {
          console.error('获取数据失败:', response.data.message);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    const fetchSearchResults = async () => {
      try {
        const countryCode = getCountryCodeFromUrl();
        const response = await webAxios.get(`/productx/website/list`, {
          params: {
            countryCode,
            name: value
          }
        });
        
        if (response.data.success) {
          const groupedData = groupNavigationData(response.data.data);
          setNavigationData(groupedData);
        } else {
          console.error('搜索失败:', response.data.message);
        }
      } catch (error) {
        console.error('搜索失败:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
      color: ${document.documentElement.classList.contains('dark') ? '#fff' : '#000'};
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      backdrop-filter: blur(8px);
      border: 1px solid ${document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    `;
    
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi bi-info-circle" style="color: #FFD700; margin-right: 8px;"></i>
        <span>请按 ${isMac ? '⌘ + D' : 'Ctrl + D'} 键添加到收藏夹</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease-out';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };

  const heroSection = (
    <HeroSection>
      <div className="container">
        <HeroTitle>
          <span className="hero-text">迪拜综合导航</span>
        </HeroTitle>
        
        <HeroSubtitle>
          <SubtitleItem iconColor="#FFD700" delay="0s">
            <i className="bi bi-building"></i>
            <span>政府服务</span>
          </SubtitleItem>
          <SubtitleItem iconColor="#4CAF50" delay="0.2s">
            <i className="bi bi-briefcase"></i>
            <span>商务信息</span>
          </SubtitleItem>
          <SubtitleItem iconColor="#FFA500" delay="0.4s">
            <i className="bi bi-compass"></i>
            <span>生活指南</span>
          </SubtitleItem>
        </HeroSubtitle>
        
        <SearchBookmarkContainer>
          <div className="search-wrapper">
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              onClear={() => setSearchTerm("")}
            />
          </div>
          <BookmarkButton onClick={handleBookmark}>
            <i className="bi bi-bookmark-plus"></i>
            <span>收藏本站</span>
          </BookmarkButton>
        </SearchBookmarkContainer>
      </div>
    </HeroSection>
  );

  return (
    <Container>
      <Header />
      
      {heroSection}

      <MainContent>
        <div className="nav-grid">
          <div className="container">
            {isLoading ? (
              <div className="text-center text-white py-5">
                <i className="bi bi-arrow-repeat spin me-2"></i>
                加载中...
              </div>
            ) : Object.keys(navigationData).length === 0 ? (
              <div className="text-center text-white py-5">
                暂无数据
              </div>
            ) : (
              <div className="row">
                {Object.entries(navigationData).map(([category, subCategories]) => (
                  <NavigationCard 
                    key={category}
                    category={category}
                    subCategories={subCategories}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </MainContent>

      <Footer />

      <AppDownloadModal />
      <SocialLinksModal />
    </Container>
  );
};

export default Navigation; 