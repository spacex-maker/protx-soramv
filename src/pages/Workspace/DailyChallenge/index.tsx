/**
 * 工作台 - 每日挑战
 * 列表页展示近期挑战卡片，点击后进入详情。
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import ChallengeHubPage from 'pages/Community/ChallengeHubPage';
import ChallengeDetailPage from 'pages/Community/ChallengeDetailPage';

const DailyChallenge: React.FC = () => {
  const { challengeId } = useParams();

  if (challengeId) {
    return <ChallengeDetailPage challengeId={challengeId} embedInWorkspace />;
  }

  return <ChallengeHubPage embedInWorkspace />;
};

export default DailyChallenge;
