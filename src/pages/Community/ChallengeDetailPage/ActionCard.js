import React from 'react';
import { Button, Statistic } from 'antd';
import { FormattedMessage } from 'react-intl';
import { PlusOutlined, InfoCircleOutlined, ClockCircleOutlined, FireFilled, CheckCircleOutlined } from '@ant-design/icons';
import { 
  DetailCard, 
  ActionCardContainer, 
  CountdownSection, 
  CountdownLabel, 
  CountdownDisplay, 
  CountdownValue,
  ActionButton,
  ActionTip
} from './styled';

const Timer = Statistic.Timer;

const ActionCard = ({ isNotStarted, isOngoing, startTime, deadline, onJoin }) => {
  const getStatusConfig = () => {
    if (isNotStarted) {
      return {
        label: <FormattedMessage id="challenge.startsIn" defaultMessage="Starts In" />,
        icon: <ClockCircleOutlined />,
        color: '#1890ff',
        gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        glow: 'rgba(24, 144, 255, 0.3)'
      };
    } else if (isOngoing) {
      return {
        label: <FormattedMessage id="challenge.timeRemaining" defaultMessage="Time Remaining" />,
        icon: <FireFilled />,
        color: '#52c41a',
        gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
        glow: 'rgba(82, 196, 26, 0.3)'
      };
    } else {
      return {
        label: <FormattedMessage id="challenge.closed" defaultMessage="Challenge Closed" />,
        icon: <CheckCircleOutlined />,
        color: '#888',
        gradient: 'linear-gradient(135deg, #888 0%, #666 100%)',
        glow: 'rgba(136, 136, 136, 0.2)'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const isDisabled = !isOngoing || isNotStarted;

  return (
    <DetailCard>
      <ActionCardContainer>
        <CountdownSection className={isOngoing ? 'live' : isNotStarted ? 'upcoming' : 'ended'}>
          <CountdownLabel className={isOngoing ? 'live' : isNotStarted ? 'upcoming' : 'ended'}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </CountdownLabel>
          
          <CountdownDisplay>
            {isNotStarted ? (
              <Timer
                type="countdown"
                value={startTime}
                format="D[d] H[h] m[m] s[s]"
                valueStyle={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: statusConfig.color,
                  lineHeight: 1.2
                }}
              />
            ) : isOngoing ? (
              <Timer
                type="countdown"
                value={deadline}
                format="D[d] H[h] m[m] s[s]"
                valueStyle={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: statusConfig.color,
                  lineHeight: 1.2
                }}
              />
            ) : (
              <CountdownValue className="closed">
                <FormattedMessage id="challenge.closed" defaultMessage="Challenge Closed" />
              </CountdownValue>
            )}
          </CountdownDisplay>
        </CountdownSection>

        <ActionButton
          type="primary"
          block
          size="large"
          shape="round"
          icon={<PlusOutlined />}
          onClick={onJoin}
          disabled={isDisabled}
          className={isOngoing ? 'active' : ''}
          gradient={statusConfig.gradient}
        >
          {isNotStarted ? (
            <FormattedMessage id="challenge.notStarted" defaultMessage="Challenge Not Started" />
          ) : isOngoing ? (
            <FormattedMessage id="challenge.submitEntry" defaultMessage="Submit Entry" />
          ) : (
            <FormattedMessage id="challenge.viewWinners" defaultMessage="View Winners" />
          )}
        </ActionButton>
        
        <ActionTip>
          <InfoCircleOutlined />
          <FormattedMessage id="challenge.readRulesTip" defaultMessage="Read the rules before submitting" />
        </ActionTip>
      </ActionCardContainer>
    </DetailCard>
  );
};

export default ActionCard;

