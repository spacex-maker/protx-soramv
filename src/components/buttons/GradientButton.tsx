import React from 'react';
import { Button } from 'antd';
import styled, { keyframes } from 'styled-components';
import type { ButtonProps } from 'antd';

/**
 * 颜色旋转动画关键帧
 * 通过 hue-rotate 滤镜实现颜色的平滑过渡
 * 从0度旋转到360度实现完整的色相循环
 */
const colorRotate = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

/**
 * 基础按钮样式
 * 设置统一的圆角、高度和内边距
 * 大尺寸按钮有特殊的高度和字体大小
 */
const StyledButton = styled(Button)`
  border-radius: 20px !important;
  height: 36px;
  padding: 0 20px;

  &.ant-btn-lg {
    height: 40px;
    padding: 0 24px;
    font-size: 16px;
  }
`;

/**
 * 渐变按钮包装器
 * 接收三个样式属性：
 * @param {string[]} $gradientColors - 自定义渐变色数组
 * @param {number} $animationDuration - 动画持续时间（秒）
 * @param {boolean} $glowEffect - 是否启用发光效果
 */
const GradientButtonWrapper = styled(StyledButton)<{
  $gradientColors?: string[];
  $animationDuration?: number;
  $glowEffect?: boolean;
}>`
  &&.ant-btn {
    position: relative;
    overflow: hidden;
    border: none !important;
    /* 设置渐变背景，支持自定义颜色或使用默认值 */
    background: ${props => 
      props.$gradientColors 
        ? `linear-gradient(45deg, ${props.$gradientColors.join(', ')})` 
        : 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)'
    } !important;
    background-size: 200% 200% !important;
    /* 应用颜色旋转动画 */
    animation: ${colorRotate} ${props => props.$animationDuration || 10}s linear infinite;
    transition: all 0.3s ease;
    color: white !important;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    /* 悬停效果 */
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      opacity: 0.95;
      animation-play-state: paused;
    }

    /* 点击效果 */
    &:active {
      transform: translateY(1px);
    }

    /* 发光效果 */
    ${props => props.$glowEffect && `
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: inherit;
        filter: blur(10px);
        opacity: 0.5;
        z-index: -1;
      }
    `}
  }
`;

/**
 * GradientButton 组件的属性接口
 * 继承自 Ant Design 的 ButtonProps
 */
export interface GradientButtonProps extends ButtonProps {
  /** 自定义渐变色数组，例如：['#ff0080', '#7b68ee'] */
  gradientColors?: string[];
  /** 动画持续时间，单位为秒，默认为 10 */
  animationDuration?: number;
  /** 是否启用发光效果，默认为 true */
  glowEffect?: boolean;
}

/**
 * 渐变动画按钮组件
 * 
 * @component
 * @example
 * // 基础用法
 * <GradientButton>基础按钮</GradientButton>
 * 
 * // 自定义渐变色
 * <GradientButton gradientColors={['#FF416C', '#FF4B2B']}>
 *   自定义渐变色
 * </GradientButton>
 * 
 * // 自定义动画时间和禁用发光效果
 * <GradientButton animationDuration={5} glowEffect={false}>
 *   自定义效果
 * </GradientButton>
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  gradientColors,
  animationDuration = 10,
  glowEffect = true,
  children,
  ...props
}) => {
  return (
    <GradientButtonWrapper
      $gradientColors={gradientColors}
      $animationDuration={animationDuration}
      $glowEffect={glowEffect}
      {...props}
    >
      {children}
    </GradientButtonWrapper>
  );
};

export default GradientButton; 