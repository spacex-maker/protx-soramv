import React, { useMemo } from 'react';
import { Empty, Segmented, Spin, Typography } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  I2iCreationMode,
  I2iOfficialPlay,
  resolvePlayDescription,
  resolvePlayDisplayName,
} from './officialPlayTypes';

const { Text } = Typography;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const PlayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
`;

const PlayCard = styled.button<{ $selected?: boolean }>`
  border: 2px solid ${(p) => (p.$selected ? '#1890ff' : 'transparent')};
  background: ${(p) => (p.$selected ? 'rgba(24, 144, 255, 0.08)' : 'var(--ant-color-fill-quaternary, rgba(0,0,0,0.02))')};
  border-radius: 16px;
  padding: 14px 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  min-height: 112px;

  &:hover {
    border-color: #1890ff;
    transform: translateY(-1px);
  }

  .emoji {
    font-size: 28px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--ant-color-text, #111);
    margin-bottom: 4px;
  }

  .desc {
    font-size: 12px;
    color: var(--ant-color-text-secondary, #666);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Hint = styled(Text)`
  display: block;
  margin-top: 4px;
  font-size: 12px;
`;

export interface OfficialPlaySectionProps {
  mode: I2iCreationMode;
  onModeChange: (mode: I2iCreationMode) => void;
  plays: I2iOfficialPlay[];
  playsLoading: boolean;
  selectedPlayCode: string | null;
  onSelectPlay: (playCode: string) => void;
}

const OfficialPlaySection: React.FC<OfficialPlaySectionProps> = ({
  mode,
  onModeChange,
  plays,
  playsLoading,
  selectedPlayCode,
  onSelectPlay,
}) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh';

  const sortedPlays = useMemo(
    () => [...plays].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [plays]
  );

  return (
    <>
      <SectionHeader>
        <Text strong>
          <FormattedMessage id="create.i2i.mode.label" defaultMessage="创作方式" />
        </Text>
        <Segmented
          value={mode}
          onChange={(val) => onModeChange(val as I2iCreationMode)}
          options={[
            {
              label: intl.formatMessage({
                id: 'create.i2i.mode.custom',
                defaultMessage: '自由创作',
              }),
              value: 'custom',
            },
            {
              label: intl.formatMessage({
                id: 'create.i2i.mode.official',
                defaultMessage: '官方玩法',
              }),
              value: 'official',
            },
          ]}
        />
      </SectionHeader>

      {mode === 'official' && (
        <>
          <Hint type="secondary">
            <FormattedMessage
              id="create.i2i.official.hint"
              defaultMessage="选择一种官方玩法，上传参考图即可生成；提示词由平台托管，不会展示给你。"
            />
          </Hint>
          {playsLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Spin />
            </div>
          ) : sortedPlays.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <FormattedMessage
                  id="create.i2i.official.empty"
                  defaultMessage="暂无官方玩法"
                />
              }
            />
          ) : (
            <PlayGrid>
              {sortedPlays.map((play) => (
                <PlayCard
                  key={play.playCode}
                  type="button"
                  $selected={selectedPlayCode === play.playCode}
                  onClick={() => onSelectPlay(play.playCode)}
                >
                  <div className="emoji">{play.coverEmoji || '🎨'}</div>
                  <div className="name">{resolvePlayDisplayName(play, locale)}</div>
                  <div className="desc">{resolvePlayDescription(play, locale)}</div>
                </PlayCard>
              ))}
            </PlayGrid>
          )}
        </>
      )}
    </>
  );
};

export default OfficialPlaySection;
