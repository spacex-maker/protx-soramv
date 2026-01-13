import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TrophyFilled, CrownFilled, StarFilled } from '@ant-design/icons';
import { DetailCard, PrizePoolHeader, PrizeRankList, PrizeRankItem, MedalIcon } from './styled';
import { parseRewardsConfig } from './utils';

const PrizeCard = ({ rewardsConfig }) => {
  const rewards = parseRewardsConfig(rewardsConfig);
  const totalPrize = rewards.first + rewards.second + rewards.third;
  
  // 计算百分比
  const getPercentage = (value) => {
    if (totalPrize === 0) return 0;
    return ((value / totalPrize) * 100).toFixed(1);
  };

  const prizeRanks = [
    {
      rank: 1,
      label: <FormattedMessage id="challenge.rank.1st" defaultMessage="1st Place" />,
      value: rewards.first,
      percentage: getPercentage(rewards.first),
      className: 'gold',
      icon: <CrownFilled />,
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
      glow: 'rgba(255, 215, 0, 0.4)'
    },
    {
      rank: 2,
      label: <FormattedMessage id="challenge.rank.2nd" defaultMessage="2nd Place" />,
      value: rewards.second,
      percentage: getPercentage(rewards.second),
      className: 'silver',
      icon: <TrophyFilled />,
      gradient: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)',
      glow: 'rgba(192, 192, 192, 0.3)'
    },
    {
      rank: 3,
      label: <FormattedMessage id="challenge.rank.3rd" defaultMessage="3rd Place" />,
      value: rewards.third,
      percentage: getPercentage(rewards.third),
      className: 'bronze',
      icon: <StarFilled />,
      gradient: 'linear-gradient(135deg, #cd7f32 0%, #e6a057 50%, #cd7f32 100%)',
      glow: 'rgba(205, 127, 50, 0.3)'
    }
  ];

  return (
    <DetailCard>
      <div className="card-title">
        <TrophyFilled style={{color:'#faad14', fontSize: 20}} /> 
        <FormattedMessage id="challenge.prizePool" defaultMessage="Prize Pool" />
      </div>
      
      <PrizePoolHeader>
        <div className="total-label">
          <FormattedMessage id="challenge.totalValue" defaultMessage="Total Value" />
        </div>
        <div className="total-amount">
          <span className="amount">{totalPrize.toLocaleString()}</span>
          <span className="unit">PTS</span>
        </div>
        <div className="total-subtitle">
          <FormattedMessage id="challenge.prizePool.subtitle" defaultMessage="Compete for amazing rewards" />
        </div>
      </PrizePoolHeader>

      <PrizeRankList>
        {prizeRanks.map((prize, index) => (
          <PrizeRankItem 
            key={prize.rank} 
            className={prize.className}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="rank-info">
              <MedalIcon 
                className={`medal ${prize.className}`}
                gradient={prize.gradient}
                glow={prize.glow}
              >
                {prize.icon}
              </MedalIcon>
              <div className="rank-details">
                <div className="rank-label">{prize.label}</div>
                <div className="rank-percentage">{prize.percentage}%</div>
              </div>
            </div>
            <div className="rank-value">
              <span className="value-number">{prize.value.toLocaleString()}</span>
              <span className="value-unit">PTS</span>
            </div>
          </PrizeRankItem>
        ))}
      </PrizeRankList>
    </DetailCard>
  );
};

export default PrizeCard;

