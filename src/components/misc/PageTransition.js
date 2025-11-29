import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * 全局页面过渡动效组件
 * 使用 framer-motion 实现从按钮位置开始的圆形扩散效果
 */
const PageTransition = ({ 
  isActive, 
  buttonRect, 
  onComplete,
  targetPath = '/signup'
}) => {
  useEffect(() => {
    if (isActive && onComplete) {
      // 动画完成后回调（1.2秒后，与动画时长一致）
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || !buttonRect || !buttonRect.width) {
    return null;
  }

  const { x, y } = buttonRect;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // 计算需要覆盖整个屏幕的半径
  const distances = [
    Math.sqrt(x ** 2 + y ** 2),
    Math.sqrt((screenWidth - x) ** 2 + y ** 2),
    Math.sqrt(x ** 2 + (screenHeight - y) ** 2),
    Math.sqrt((screenWidth - x) ** 2 + (screenHeight - y) ** 2),
  ];
  const maxRadius = Math.max(...distances) * 1.5;
  const initialRadius = Math.max(buttonRect.width / 2, 50);

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 圆形遮罩层 - 半透明毛玻璃效果 */}
          <motion.div
            style={{
              position: 'absolute',
              top: `${y}px`,
              left: `${x}px`,
              width: `${initialRadius * 2}px`,
              height: `${initialRadius * 2}px`,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              transformOrigin: 'center center',
              overflow: 'hidden',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
            }}
            initial={{
              scale: 0,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              scale: maxRadius / initialRadius,
              x: '-50%',
              y: '-50%',
            }}
            transition={{
              duration: 1.2,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PageTransition;
