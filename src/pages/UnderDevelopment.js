import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, theme } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

// --- Styled Components (Modern Minimalist) ---

const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #000; /* 纯深黑背景 */
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000000 60%);
  z-index: 0;
  pointer-events: none;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end; /* UI 沉底，留出中间给 3D 物体 */
  padding-bottom: 80px;
  z-index: 10;
  pointer-events: none;
`;

const ContentBox = styled(motion.div)`
  text-align: center;
  pointer-events: auto;
  z-index: 20;
  
  h1 {
    color: #fff;
    font-size: 48px;
    font-weight: 600;
    letter-spacing: -1px;
    margin-bottom: 16px;
    background: linear-gradient(180deg, #fff 0%, #aaa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #888;
    font-size: 18px;
    margin-bottom: 40px;
    font-weight: 300;
    max-width: 500px;
    line-height: 1.6;
    margin-left: auto;
    margin-right: auto;
  }
`;

const ModernButton = styled(Button)`
  && {
    height: 48px;
    padding: 0 32px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    &:hover {
      background: #fff;
      color: #000;
      border-color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);

  span.dot {
    width: 8px;
    height: 8px;
    background: #00ff88;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ff88;
  }
`;

// --- 3D Scene: The "Liquid Brain" ---

const LiquidOrb = () => {
  const meshRef = useRef(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // 缓慢自转
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        scale={2.2}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[1, 128, 128]} /> {/* 高面数以保证变形平滑 */}
        <MeshDistortMaterial
          color={hovered ? "#ffffff" : "#1a1a1a"} // 悬停变白，平时深黑
          attach="material"
          distort={0.55} // 强烈的液态变形
          speed={2} // 快速流动
          roughness={0} // 像镜子一样光滑
          metalness={1} // 全金属质感
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
    </Float>
  );
};

// --- Main Component ---

const UnderDevelopment = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <PageWrapper>
        {/* 背景渐变层 */}
        <BackgroundGradient />

        {/* 3D 场景 */}
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
          {/* 环境光照贴图：这是让金属球看起来好看的关键 */}
          {/* preset="warehouse" 提供这种高冷的工业黑白光泽 */}
          <Environment preset="warehouse" /> 
          
          <LiquidOrb />
          
          {/* 底部阴影，增加落地感 */}
          <ContactShadows 
            position={[0, -3, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2.5} 
            far={4} 
            color="#000"
          />
        </Canvas>

        {/* UI 层 */}
        <UIOverlay>
          <ContentBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <StatusBadge>
              <span className="dot" />
              {intl.formatMessage({ 
                id: 'underDevelopment.comingSoon', 
                defaultMessage: 'Coming Soon' 
              })}
            </StatusBadge>

            <h1>
              {intl.formatMessage({ 
                id: 'underDevelopment.title', 
                defaultMessage: 'Something amazing is brewing' 
              })}
            </h1>
            
            <p>
              {intl.formatMessage({ 
                id: 'underDevelopment.subtitle', 
                defaultMessage: 'We are crafting a new experience. Stay tuned for the future of creation.' 
              })}
            </p>

            <ButtonGroup>
              <ModernButton 
                onClick={() => navigate('/')}
                icon={<HomeOutlined />}
              >
                {intl.formatMessage({ 
                  id: 'underDevelopment.backHome', 
                  defaultMessage: 'Back to Home' 
                })}
              </ModernButton>
              
              <ModernButton 
                onClick={() => navigate(-1)}
                icon={<ArrowLeftOutlined />}
                style={{ background: 'transparent', border: 'none' }} // 次要按钮更低调
              >
                 {intl.formatMessage({ 
                  id: 'underDevelopment.goBack', 
                  defaultMessage: 'Go Back' 
                })}
              </ModernButton>
            </ButtonGroup>
          </ContentBox>
        </UIOverlay>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default UnderDevelopment;