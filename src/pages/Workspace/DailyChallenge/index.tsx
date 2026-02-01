/**
 * 工作台 - 每日挑战
 * 单独文件夹，嵌入工作台左侧菜单对应的内容区，展示当前每日挑战详情。
 */
import React, { useState, useEffect } from 'react';
import { Spin, Empty, message } from 'antd';
import { getCurrentChallenge } from 'api/community';
import ChallengeDetailPage from 'pages/Community/ChallengeDetailPage';
import { useIntl } from 'react-intl';

const DailyChallenge: React.FC = () => {
  const intl = useIntl();
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentChallenge()
      .then((data) => {
        if (!cancelled && data?.id) {
          setCurrentChallengeId(data.id);
        } else {
          setCurrentChallengeId(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentChallengeId(null);
          message.error(intl.formatMessage({ id: 'community.challenge.loadFailed', defaultMessage: 'Failed to load challenge' }));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [intl]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <Spin size="large" tip={intl.formatMessage({ id: 'common.loading', defaultMessage: 'Loading...' })} />
      </div>
    );
  }

  if (!currentChallengeId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <Empty
          description={intl.formatMessage({ id: 'challenge.noCurrent', defaultMessage: '暂无进行中的每日挑战' })}
        />
      </div>
    );
  }

  return (
    <ChallengeDetailPage
      challengeId={currentChallengeId}
      embedInWorkspace
    />
  );
};

export default DailyChallenge;
