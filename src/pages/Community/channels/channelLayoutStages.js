import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 90, damping: 22, mass: 0.8 };
const springSnappy = { type: 'spring', stiffness: 140, damping: 24 };

const Stage = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 48px 72px;
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 92px 24px 56px;
  }
`;

const EditorialStage = styled(Stage)`
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  max-width: none;
  padding: 0;

  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const EditorialContent = styled(motion.div)`
  flex: 0 0 46%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px max(48px, 5vw) 72px max(48px, 5vw);
  box-sizing: border-box;
  min-height: 100vh;

  @media (max-width: 960px) {
    flex: none;
    min-height: auto;
    padding: 100px 24px 32px;
    order: 2;
  }
`;

const MediaFill = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
`;

const EditorialMedia = styled(motion.div)`
  flex: 1;
  min-height: 100vh;
  position: relative;

  @media (max-width: 960px) {
    min-height: 58vh;
    order: 1;
  }
`;

const MonumentMedia = styled(motion.div)`
  width: 100%;
  height: min(78vh, 820px);
  min-height: 480px;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  margin-bottom: 48px;
  transform-style: preserve-3d;
  box-shadow:
    0 40px 100px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;

  @media (max-width: 768px) {
    height: 56vh;
    min-height: 320px;
    border-radius: 20px;
    margin-bottom: 32px;
  }
`;

const PrismPanel = styled(motion.div)`
  margin-left: auto;
  width: min(100%, 520px);
  padding: 44px 40px;
  border-radius: 32px;
  background: rgba(12, 12, 18, 0.55);
  backdrop-filter: blur(48px) saturate(160%);
  -webkit-backdrop-filter: blur(48px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;

  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 24px;
    margin-left: 0;
  }
`;

const CinematicContent = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: 720px;
  padding-bottom: 24px;
`;

const OrbitWrap = styled(motion.div)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52vh;
  position: relative;
`;

const OrbitRing = styled(motion.div)`
  position: absolute;
  width: min(72vw, 520px);
  height: min(72vw, 520px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: none;
`;

const OrbitImage = styled(motion.div)`
  width: min(58vw, 420px);
  height: min(58vw, 420px);
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
`;

const PeelStage = styled(Stage)`
  align-items: flex-end;
  justify-content: center;
`;

const PeelCard = styled(motion.div)`
  position: relative;
  width: min(92vw, 680px);
  height: min(62vh, 520px);
  border-radius: 24px;
  overflow: hidden;
  transform-style: preserve-3d;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
`;

const PeelFold = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  width: 42%;
  height: 42%;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  transform-origin: top right;
`;

const HorizonStrip = styled(motion.div)`
  width: 100%;
  height: min(42vh, 380px);
  min-height: 220px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 40px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
`;

const HorizonImg = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 140%;
  height: 100%;
  background-size: cover;
  background-position: center;
`;

const PortalStage = styled(Stage)`
  align-items: center;
  justify-content: center;
  gap: 40px;
`;

const PortalRing = styled(motion.div)`
  width: min(68vw, 480px);
  height: min(68vw, 480px);
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 40px 100px rgba(0, 0, 0, 0.55);
`;

const PortalContent = styled(motion.div)`
  text-align: center;
  max-width: 560px;
`;

const StackWrap = styled(motion.div)`
  position: relative;
  width: 100%;
  height: min(58vh, 520px);
  min-height: 320px;
  margin-bottom: 40px;
`;

const StackLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const DiagonalStage = styled(Stage)`
  flex-direction: row;
  align-items: center;
  gap: 0;
  max-width: none;
  padding: 0;

  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const DiagonalMedia = styled(motion.div)`
  flex: 1;
  min-height: 100vh;
  position: relative;
  clip-path: polygon(12% 0, 100% 0, 100% 100%, 0 100%);

  @media (max-width: 960px) {
    min-height: 52vh;
    clip-path: none;
  }
`;

const DiagonalContent = styled(motion.div)`
  flex: 0 0 42%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px max(40px, 4vw) 72px max(48px, 5vw);
  box-sizing: border-box;

  @media (max-width: 960px) {
    flex: none;
    padding: 32px 24px 48px;
  }
`;

const sweepBeam = keyframes`
  0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
`;

const SweepBeam = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -20%;
    left: 0;
    width: 35%;
    height: 140%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    animation: ${sweepBeam} 2.8s ease-in-out infinite;
    animation-play-state: ${({ $active }) => ($active ? 'running' : 'paused')};
  }
`;

const MagnetStage = styled(Stage)`
  align-items: center;
  justify-content: center;
`;

const FloatCard = styled(motion.div)`
  width: min(92vw, 640px);
  border-radius: 32px;
  overflow: hidden;
  background: rgba(12, 12, 18, 0.65);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
`;

const FloatMedia = styled(motion.div)`
  height: min(42vh, 360px);
  min-height: 200px;
  position: relative;
  overflow: hidden;
`;

const FloatBody = styled.div`
  padding: 36px 40px 40px;

  @media (max-width: 768px) {
    padding: 28px 24px 32px;
  }
`;

const GlitchSlice = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: ${({ $active }) => ($active ? 0.7 : 0)};
`;

export function CinematicStage({ contentBlock, isActive, spotlight }) {
  return (
    <Stage>
      <CinematicContent
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        {contentBlock}
      </CinematicContent>
    </Stage>
  );
}

export function EditorialStageView({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  return (
    <EditorialStage>
      <EditorialContent
        initial={{ opacity: 0.5, x: -48 }}
        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: -24 }}
        transition={spring}
      >
        {contentBlock}
      </EditorialContent>
      <EditorialMedia
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        <MediaFill style={{ ...imageStyle, scale: activeScale }} />
      </EditorialMedia>
    </EditorialStage>
  );
}

export function MonumentStage({ contentBlock, isActive, imageStyle, activeScale, tiltRotateX, tiltRotateY, pulse, spotlight }) {
  return (
    <Stage>
      <MonumentMedia
        key={pulse}
        style={{
          rotateX: tiltRotateX,
          rotateY: tiltRotateY,
        }}
        initial={{ opacity: 0.65, scale: 0.94 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.55, scale: 0.96 }}
        transition={springSnappy}
      >
        <MediaFill style={{ ...imageStyle, scale: activeScale }} />
      </MonumentMedia>
      <motion.div
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        {contentBlock}
      </motion.div>
    </Stage>
  );
}

export function PrismStage({ contentBlock, isActive, spotlight }) {
  return (
    <Stage style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
      <PrismPanel
        initial={{ opacity: 0.5, x: 56, y: 24 }}
        animate={
          isActive
            ? { opacity: 1, x: 0, y: 0, scale: [1, 1.02, 1] }
            : { opacity: 0.55, x: 28, y: 12, scale: 1 }
        }
        transition={isActive ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : spring}
      >
        {contentBlock}
      </PrismPanel>
    </Stage>
  );
}

export function OrbitStage({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  return (
    <Stage>
      <OrbitWrap>
        <OrbitRing
          animate={isActive ? { rotate: 360, scale: [1, 1.04, 1] } : { rotate: 0, scale: 0.92 }}
          transition={
            isActive
              ? { rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }
              : spring
          }
        />
        <OrbitRing
          style={{ width: '88%', height: '88%' }}
          animate={isActive ? { rotate: -360 } : { rotate: 0 }}
          transition={isActive ? { duration: 18, repeat: Infinity, ease: 'linear' } : spring}
        />
        <OrbitImage
          initial={spotlight.inner.idle}
          animate={
            isActive
              ? {
                  ...spotlight.inner.active,
                  y: [0, -14, 0, 10, 0],
                  x: [0, 8, 0, -6, 0],
                }
              : spotlight.inner.idle
          }
          transition={
            isActive
              ? {
                  ...spotlight.inner.transition,
                  y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                }
              : spotlight.inner.transition
          }
        >
          <MediaFill style={{ ...imageStyle, scale: activeScale }} />
        </OrbitImage>
      </OrbitWrap>
      <motion.div
        initial={{ opacity: 0.5, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 16 }}
        transition={spring}
      >
        {contentBlock}
      </motion.div>
    </Stage>
  );
}

export function PeelStageView({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  return (
    <PeelStage>
      <PeelCard
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        <MediaFill style={{ ...imageStyle, scale: activeScale }} />
        <PeelFold
          animate={
            isActive
              ? { rotate: [0, -8, 0], opacity: [0.6, 1, 0.7] }
              : { rotate: 12, opacity: 0.4 }
          }
          transition={isActive ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : spring}
        />
      </PeelCard>
      <motion.div
        style={{ width: 'min(92vw, 680px)', marginTop: 32 }}
        initial={{ opacity: 0.5, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 16 }}
        transition={spring}
      >
        {contentBlock}
      </motion.div>
    </PeelStage>
  );
}

export function HorizonStage({ contentBlock, isActive, imageStyle, panX, spotlight }) {
  return (
    <Stage>
      <HorizonStrip>
        <HorizonImg style={{ ...imageStyle, x: panX }} />
      </HorizonStrip>
      <motion.div
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        {contentBlock}
      </motion.div>
    </Stage>
  );
}

export function PortalStageView({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  return (
    <PortalStage>
      <PortalRing
        initial={{ scale: 0.35, opacity: 0.5 }}
        animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.45 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <MediaFill
          style={{ ...imageStyle, scale: activeScale }}
          animate={isActive ? { scale: [1.06, 1, 1.04] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </PortalRing>
      <PortalContent
        initial={{ opacity: 0.5, y: 32 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.55, y: 20 }}
        transition={spring}
      >
        {contentBlock}
      </PortalContent>
    </PortalStage>
  );
}

export function StackStage({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  const offsets = [
    { x: 0, y: 0, rotate: 0, z: 3 },
    { x: -28, y: 18, rotate: -4, z: 2 },
    { x: 28, y: 36, rotate: 4, z: 1 },
  ];

  return (
    <Stage>
      <StackWrap>
        {offsets.map((off, i) => (
          <StackLayer
            key={i}
            style={{ zIndex: off.z }}
            initial={{ x: off.x, y: off.y, rotate: off.rotate, opacity: 0.5 }}
            animate={
              isActive
                ? { x: off.x * (i === 0 ? 0 : 1.8), y: off.y * 0.5, rotate: off.rotate * 2, opacity: 1 - i * 0.12 }
                : { x: off.x, y: off.y, rotate: off.rotate, opacity: 0.35 }
            }
            transition={{ ...springSnappy, delay: i * 0.06 }}
          >
            <MediaFill style={{ ...imageStyle, scale: activeScale, opacity: 1 - i * 0.08 }} />
          </StackLayer>
        ))}
      </StackWrap>
      <motion.div
        initial={spotlight.inner.idle}
        animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
        transition={spotlight.inner.transition}
      >
        {contentBlock}
      </motion.div>
    </Stage>
  );
}

export function GlitchStage({ contentBlock, isActive, imageStyle, activeScale, spotlight, accent }) {
  return (
    <Stage>
      <MonumentMedia
        style={{ marginBottom: 32 }}
        animate={isActive ? { x: [0, -4, 3, 0] } : {}}
        transition={{ duration: 0.35, repeat: isActive ? Infinity : 0, repeatDelay: 2.5 }}
      >
        <MediaFill style={{ ...imageStyle, scale: activeScale }} />
        <GlitchSlice
          $active={isActive}
          style={{ background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }}
          animate={isActive ? { opacity: [0, 0.8, 0], x: [0, 8, -6, 0] } : { opacity: 0, x: 0 }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
        />
      </MonumentMedia>
      <motion.div
        initial={{ opacity: 0.5, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 16 }}
        transition={spring}
      >
        {contentBlock}
      </motion.div>
    </Stage>
  );
}

export function SweepStage({ contentBlock, isActive, imageStyle, activeScale, spotlight }) {
  return (
    <DiagonalStage>
      <DiagonalContent
        initial={{ opacity: 0.5, x: -32 }}
        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: -16 }}
        transition={spring}
      >
        {contentBlock}
      </DiagonalContent>
      <DiagonalMedia initial={spotlight.inner.idle} animate={isActive ? spotlight.inner.active : spotlight.inner.idle} transition={spotlight.inner.transition}>
        <MediaFill style={{ ...imageStyle, scale: activeScale }} />
        <SweepBeam $active={isActive} />
      </DiagonalMedia>
    </DiagonalStage>
  );
}

export function MagnetStageView({
  contentBlock,
  isActive,
  imageStyle,
  activeScale,
  magnetX,
  magnetY,
  spotlight,
}) {
  return (
    <MagnetStage>
      <FloatCard
        style={{ x: magnetX, y: magnetY }}
        initial={{ opacity: 0.55, scale: 0.94 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.96 }}
        transition={spring}
      >
        <FloatMedia>
          <MediaFill style={{ ...imageStyle, scale: activeScale }} />
        </FloatMedia>
        <FloatBody>
          <motion.div
            initial={spotlight.inner.idle}
            animate={isActive ? spotlight.inner.active : spotlight.inner.idle}
            transition={spotlight.inner.transition}
          >
            {contentBlock}
          </motion.div>
        </FloatBody>
      </FloatCard>
    </MagnetStage>
  );
}
