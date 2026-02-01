import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Modal, Progress, Tabs, theme, Tag } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useIntl } from "react-intl";
import {
  TrophyFilled,
  ExperimentFilled,
  ThunderboltFilled,
  CrownFilled,
  StarFilled,
  LockFilled,
  CheckCircleFilled,
  RightOutlined,
  SafetyCertificateFilled,
  RocketFilled,
  DollarOutlined,
  TeamOutlined
} from "@ant-design/icons";

// ==========================================
// 1. 动效定义
// ==========================================

const float3D = keyframes`
  0% { transform: perspective(1000px) rotateY(0deg) translateY(0); }
  50% { transform: perspective(1000px) rotateY(10deg) translateY(-10px); }
  100% { transform: perspective(1000px) rotateY(0deg) translateY(0); }
`;

const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
`;

// ==========================================
// 2. 样式组件
// ==========================================

// 修复：接收 $token 并强制覆盖默认样式
const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 24px;
    overflow: hidden;
    
    /* 核心修复：强制使用 Token 中的背景色，去除默认白边 */
    background-color: ${props => props.$token.colorBgElevated} !important;
    
    /* 增加细腻的边框，提升深色模式下的质感 */
    border: 1px solid ${props => props.$token.colorBorderSecondary};
    
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  
  .ant-modal-close {
    top: 24px;
    right: 24px;
    color: ${props => props.$token.colorTextSecondary};
    background: ${props => props.$token.colorFillQuaternary};
    border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    
    &:hover { 
      background: ${props => props.$token.colorFillTertiary};
      color: ${props => props.$token.colorText};
    }
  }
`;

const Layout = styled.div`
  display: flex;
  min-height: 600px;
  background: ${props => props.$token.colorBgContainer};
  @media (max-width: 768px) { flex-direction: column; }
`;

const Sidebar = styled.div`
  width: 280px;
  background: ${props => props.$token.colorBgLayout}; 
  padding: 40px 24px;
  border-right: 1px solid ${props => props.$token.colorBorderSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 24px;
    flex-direction: row;
    justify-content: space-between;
    border-right: none;
    border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  }
`;

const AvatarRing = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 6px;
  background: conic-gradient(from 0deg, ${props => props.$token.colorPrimary}, #7928ca, ${props => props.$token.colorPrimary});
  animation: ${shine} 4s linear infinite;
  margin-bottom: 24px;
  position: relative;

  .inner-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${props => props.$token.colorBgContainer};
    border: 4px solid ${props => props.$token.colorBgLayout};
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .level-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ffd700;
    color: #000;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800;
    font-size: 14px;
    border: 3px solid ${props => props.$token.colorBgLayout};
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  @media (max-width: 768px) {
    width: 80px; height: 80px; margin-bottom: 0;
  }
`;

const UserStats = styled.div`
  width: 100%;
  
  h2 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: ${props => props.$token.colorText};
  }
  
  .title {
    font-size: 12px;
    color: ${props => props.$token.colorPrimary};
    background: ${props => props.$token.colorPrimaryBg};
    padding: 4px 12px;
    border-radius: 100px;
    display: inline-block;
    margin-bottom: 32px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
  }

  .stat-item {
    background: ${props => props.$token.colorBgContainer};
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${props => props.$token.colorBorderSecondary};
    
    .val { font-size: 18px; font-weight: 700; color: ${props => props.$token.colorText}; }
    .lbl { font-size: 11px; color: ${props => props.$token.colorTextSecondary}; margin-top: 4px; }
  }

  @media (max-width: 768px) {
    width: auto;
    text-align: left;
    margin-left: 20px;
    flex: 1;
    .title { margin-bottom: 8px; }
    .stat-grid { display: none; }
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  background: ${props => props.$token.colorBgContainer};
  overflow-y: auto;
  max-height: 80vh;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${props => props.$token.colorFillSecondary}; border-radius: 3px; }

  @media (max-width: 768px) { padding: 24px; }
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;

  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: ${props => props.$token.colorText};
  }
  
  .view-all {
    font-size: 14px;
    color: ${props => props.$token.colorTextSecondary};
    cursor: pointer;
    &:hover { color: ${props => props.$token.colorPrimary}; }
  }
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const BadgeCard = styled(motion.div)`
  position: relative;
  aspect-ratio: 1/1.2;
  background: ${props => props.$active 
    ? `linear-gradient(180deg, ${props.$token.colorBgContainer}, ${props.$token.colorFillQuaternary})`
    : props.$token.colorBgLayout};
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid ${props => props.$active ? props.$token.colorPrimaryBorder : props.$token.colorBorderSecondary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: ${props => props.$active ? 1 : 0.6};
  filter: ${props => props.$active ? 'none' : 'grayscale(100%)'};

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    border-color: ${props => props.$token.colorPrimary};
    opacity: 1;
    filter: none;
    background: ${props => props.$token.colorBgContainer};
    
    .icon-3d { animation: ${float3D} 3s ease-in-out infinite; }
  }

  .icon-3d {
    font-size: 48px;
    margin-bottom: 16px;
    color: ${props => props.$color};
    filter: drop-shadow(0 8px 16px ${props => props.$color}60);
    transition: transform 0.3s;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin-bottom: 4px;
  }

  .desc {
    font-size: 12px;
    color: ${props => props.$token.colorTextSecondary};
    line-height: 1.4;
  }

  .progress-mini {
    width: 100%;
    height: 4px;
    background: ${props => props.$token.colorFillSecondary};
    border-radius: 2px;
    margin-top: 12px;
    overflow: hidden;
    
    .bar {
      height: 100%;
      background: ${props => props.$token.colorPrimary};
      width: ${props => props.$percent}%;
    }
  }

  .lock-overlay {
    position: absolute;
    top: 12px; right: 12px;
    color: ${props => props.$token.colorTextQuaternary};
  }
`;

const MilestoneBanner = styled.div`
  background: linear-gradient(90deg, ${props => props.$token.colorPrimary} 0%, #9f55ff 100%);
  border-radius: 20px;
  padding: 32px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -50%; right: -10%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    filter: blur(40px);
  }

  .left {
    position: relative; z-index: 2;
    h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #fff; }
    p { font-size: 14px; opacity: 0.9; margin: 0; color: rgba(255,255,255,0.9); }
  }

  .right {
    position: relative; z-index: 2;
    text-align: right;
    .xp { font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #fff; }
    .xp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; color: rgba(255,255,255,0.8); }
  }
`;

// ==========================================
// 3. 数据配置
// ==========================================

const RocketOutlinedIcon = styled(RocketFilled)` font-size: 40px; `;

const achievementsData = [
  { id: 'c1', name: '初次尝试', desc: '生成第一张图片', icon: <ExperimentFilled />, color: '#3b82f6', target: 1, current: 1, reward: 10 },
  { id: 'c2', name: '量产机器', desc: '生成 100 次任务', icon: <RocketOutlinedIcon />, color: '#8b5cf6', target: 100, current: 45, reward: 100 },
  { id: 'c3', name: '光影大师', desc: '使用 Upscale 功能', icon: <ThunderboltFilled />, color: '#f59e0b', target: 1, current: 1, reward: 50 },
  { id: 's1', name: '独乐乐', desc: '邀请 1 位好友', icon: <CheckCircleFilled />, color: '#10b981', target: 1, current: 3, reward: 200 },
  { id: 's2', name: '社群领袖', desc: '邀请 10 位好友', icon: <CrownFilled />, color: '#f43f5e', target: 10, current: 3, reward: 1000 },
  { id: 'col1', name: '黄金会员', desc: '订阅 Pro 套餐', icon: <StarFilled />, color: '#ffd700', target: 1, current: 0, reward: 500 },
  { id: 'col2', name: '安全卫士', desc: '完成实名认证', icon: <SafetyCertificateFilled />, color: '#06b6d4', target: 1, current: 1, reward: 50 },
];


// ==========================================
// 4. 逻辑组件
// ==========================================

const AchievementModal = ({ open, onClose, userInfo }) => {
  const { token } = theme.useToken();
  const intl = useIntl();

  // 计算总经验和等级
  const totalExp = achievementsData.reduce((acc, cur) => cur.current >= cur.target ? acc + cur.reward : acc, 0);
  // 优先使用 userInfo.level，如果没有则使用计算值
  const calculatedLevel = Math.floor(totalExp / 100) + 1;
  const level = userInfo?.level || calculatedLevel;
  const nextLevelExp = level * 100;
  const currentLevelExp = totalExp % 100;

  const list = achievementsData; 

  return (
    <StyledModal
      $token={token} // 关键修复：将 token 传递给 StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnHidden
      closeIcon={null}
      styles={{ mask: { 
        backdropFilter: 'blur(20px)', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      } }}
    >
      <Layout $token={token}>
        
        {/* 左侧：个人中心 */}
        <Sidebar $token={token}>
          <AvatarRing $token={token}>
            <div className="inner-img">
               <img src={userInfo?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="avatar" />
            </div>
            <div className="level-badge">{level}</div>
          </AvatarRing>
          
          <UserStats $token={token}>
            <h2>{userInfo?.nickname || 'Creator'}</h2>
            <span className="title">AI 创作者 Lv.{level}</span>
            
            <div className="stat-grid">
              <div className="stat-item">
                <div className="val">{list.filter(i => i.current >= i.target).length}</div>
                <div className="lbl">已解锁</div>
              </div>
              <div className="stat-item">
                <div className="val">{totalExp}</div>
                <div className="lbl">总积分</div>
              </div>
              <div className="stat-item">
                <div className="val">#{userInfo?.rank || 999}</div>
                <div className="lbl">当前排名</div>
              </div>
              <div className="stat-item">
                <div className="val">98%</div>
                <div className="lbl">超越用户</div>
              </div>
            </div>
          </UserStats>
        </Sidebar>

        {/* 右侧：成就墙 */}
        <MainContent $token={token}>
          
          {/* 最近里程碑 */}
          <SectionTitle $token={token}>
            <h3>当前进度</h3>
          </SectionTitle>
          <MilestoneBanner $token={token}>
            <div className="left">
              <h2>下一等级: Lv.{level + 1}</h2>
              <p>再获得 {nextLevelExp - currentLevelExp} 经验值即可升级，解锁更多生成权益。</p>
              <Progress 
                percent={(currentLevelExp / 100) * 100} 
                showInfo={false} 
                strokeColor="#fff" 
                trailColor="rgba(255,255,255,0.2)" 
                style={{ marginTop: 16, maxWidth: 300 }}
              />
            </div>
            <div className="right">
              <div className="xp">{currentLevelExp} / {nextLevelExp}</div>
              <div className="xp-label">XP Points</div>
            </div>
          </MilestoneBanner>

          {/* 成就列表 */}
          <SectionTitle $token={token}>
            <h3>成就徽章</h3>
            <span className="view-all">查看全部 <RightOutlined /></span>
          </SectionTitle>

          <BadgeGrid>
            <AnimatePresence>
              {list.map((item, index) => {
                const isUnlocked = item.current >= item.target;
                const percent = Math.min((item.current / item.target) * 100, 100);
                
                return (
                  <BadgeCard
                    key={item.id}
                    $active={isUnlocked}
                    $color={item.color}
                    $percent={percent}
                    $token={token}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isUnlocked ? 1 : 0.6, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {!isUnlocked && <LockFilled className="lock-overlay" />}
                    
                    <div className="icon-3d">{item.icon}</div>
                    
                    <div className="name">{item.name}</div>
                    <div className="desc">{item.desc}</div>
                    
                    {isUnlocked ? (
                      <Tag color="gold" style={{ marginTop: 12, border: 'none', borderRadius: 10 }}>
                        +{item.reward} XP
                      </Tag>
                    ) : (
                      <div className="progress-mini">
                        <div className="bar" />
                      </div>
                    )}
                  </BadgeCard>
                );
              })}
            </AnimatePresence>
          </BadgeGrid>

        </MainContent>
      </Layout>
    </StyledModal>
  );
};

export default AchievementModal;