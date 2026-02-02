import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Spin, Descriptions } from 'antd';
import OpenRobotXHeader from '../components/OpenRobotXHeader';
import FooterSection from '../components/FooterSection';
import { PageContainer } from '../styles';
import { getHumanoidRobotById } from '../../../api/openrobotx';

const addImageCompressSuffix = (url, width = 1200) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: #0a0e17;
`;

const ContentWrap = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
`;

const BackBtn = styled.button`
  margin-bottom: 24px;
  padding: 8px 0;
  font-size: 14px;
  color: #9aa0a6;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { color: #00d4aa; }
`;

const Hero = styled.div`
  width: 100%;
  max-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0,0,0,0.3);
  margin-bottom: 32px;
  img {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    display: block;
  }
`;

const Title = styled.h1`
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #9aa0a6;
  margin: 0 0 24px;
`;

const SpecWrap = styled.div`
  .ant-descriptions-item-label { color: #9aa0a6; }
  .ant-descriptions-item-content { color: #e8eaed; }
`;

const RobotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getHumanoidRobotById(id)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setRobot(res.data);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <SpinWrap>
        <Spin size="large" />
      </SpinWrap>
    );
  }

  if (notFound || !robot) {
    return <Navigate to="/openrobotx" replace />;
  }

  const items = [
    robot.countryOrigin && { label: '产地', children: robot.countryOrigin },
    robot.heightCm != null && { label: '高度 (cm)', children: robot.heightCm },
    robot.weightKg != null && { label: '体重 (kg)', children: robot.weightKg },
    robot.totalDof != null && { label: '总自由度 (DOF)', children: robot.totalDof },
    robot.handDofPerHand != null && { label: '手部自由度/手', children: robot.handDofPerHand },
    robot.totalPayloadKg != null && { label: '全身负载 (kg)', children: robot.totalPayloadKg },
    robot.walkingSpeedKmh != null && { label: '行走速度 (km/h)', children: robot.walkingSpeedKmh },
    robot.runningSpeedKmh != null && { label: '奔跑速度 (km/h)', children: robot.runningSpeedKmh },
    robot.batteryLifeHours != null && { label: '电池续航 (h)', children: robot.batteryLifeHours },
    robot.priceUsd && { label: '价格 (USD)', children: robot.priceUsd },
    robot.targetApplication && { label: '目标应用', children: robot.targetApplication },
    robot.aiCoreModel && { label: 'AI 核心', children: robot.aiCoreModel },
    robot.availabilityStatus && { label: '可用状态', children: robot.availabilityStatus },
    robot.officialWebsite && {
      label: '官网',
      children: (
        <a href={robot.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa' }}>
          {robot.officialWebsite}
        </a>
      ),
    },
  ].filter(Boolean);

  return (
    <PageContainer>
      <OpenRobotXHeader />
      <ContentWrap>
        <BackBtn type="button" onClick={() => navigate('/openrobotx')}>
          ← 返回 Open Robot X
        </BackBtn>
        {robot.imageUrl && (
          <Hero>
            <img src={addImageCompressSuffix(robot.imageUrl, 1200)} alt={`${robot.company} ${robot.model}`} />
          </Hero>
        )}
        <Title>{robot.company} · {robot.model}</Title>
        {(robot.targetApplication || robot.highlightsNotes) && (
          <Subtitle>{robot.targetApplication || robot.highlightsNotes}</Subtitle>
        )}
        <SpecWrap>
          <Descriptions column={1} bordered size="small" items={items} />
        </SpecWrap>
      </ContentWrap>
      <FooterSection />
    </PageContainer>
  );
};

export default RobotPage;
