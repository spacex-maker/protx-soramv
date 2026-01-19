import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// 炫彩渐变动画
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 闪烁动画
const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0;
  margin: 0;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
  background: transparent;
  border: none;
  outline: none;

  &:hover {
    transform: translateY(-1px);
  }
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
  padding: 0;
  margin: 0;
  background: transparent;
`;

const BrandText = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
  position: relative;
  z-index: 2;
  padding: 0;
  margin: 0;
  background: transparent;
  line-height: 1;

  .full-name,
  .short-name {
    background: linear-gradient(
      135deg,
      #3b82f6 0%,
      #8b5cf6 25%,
      #ec4899 50%,
      #f59e0b 75%,
      #10b981 100%,
      #3b82f6 100%
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 5s ease infinite;
    position: relative;
    display: inline-block;
    
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      background: linear-gradient(
        135deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #ec4899 50%,
        #f59e0b 75%,
        #10b981 100%,
        #3b82f6 100%
      );
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: blur(8px);
      opacity: 0.6;
      animation: ${gradientShift} 5s ease infinite;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(99, 179, 237, 0.15),
        transparent
      );
      animation: ${shimmer} 3s infinite;
      z-index: -1;
      pointer-events: none;
      mix-blend-mode: overlay;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    
    .full-name {
      display: none;
    }
    
    .short-name {
      display: block;
    }
  }

  @media (min-width: 769px) {
    .full-name {
      display: block;
    }
    
    .short-name {
      display: none;
    }
  }
`;

const Logo = () => {
  return (
    <>
      <LogoLink to="/">
        <BrandContainer>
          <BrandText>
            <span className="full-name" data-text="AI2OBJ">AI2OBJ</span>
            <span className="short-name" data-text="AI2OBJ">AI2OBJ</span>
          </BrandText>
        </BrandContainer>
      </LogoLink>
    </>
  );
};

export default Logo; 