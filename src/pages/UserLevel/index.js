import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Avatar,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Spin,
  Tabs,
  Tag,
  Timeline,
  theme,
  Typography,
} from 'antd';
import {
  CrownOutlined,
  FireOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import {
  getUserExpLogs,
  getUserLevelConfigs,
  getUserLevelOverview,
} from 'api/userLevel';

const { Title, Text, Paragraph } = Typography;

const PageWrap = styled.div`
  min-height: 100vh;
  background: ${(p) => p.$token.colorBgLayout};
  padding-top: 80px;
`;

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 48px;
`;

const HeroCard = styled(Card)`
  border-radius: 20px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, ${(p) => p.$accent}18 0%, ${(p) => p.$token.colorBgContainer} 60%);
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};

  .hero-row {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }

  .level-badge {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    background: ${(p) => p.$badgeColor || p.$accent};
    box-shadow: 0 12px 30px ${(p) => p.$accent}44;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;

const ActionItem = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  background: ${(p) => p.$token.colorBgContainer};

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .exp {
    color: ${(p) => p.$accent};
    font-weight: 700;
  }
`;

const LevelStep = styled.div`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$active ? p.$accent : p.$token.colorBorderSecondary)};
  background: ${(p) => (p.$active ? `${p.$accent}10` : p.$token.colorBgContainer)};
  margin-bottom: 12px;
`;

const CATEGORY_LABELS = {
  login: { id: 'userLevel.category.login', defaultMessage: '登录' },
  community: { id: 'userLevel.category.community', defaultMessage: '社区互动' },
  challenge: { id: 'userLevel.category.challenge', defaultMessage: '挑战活动' },
  ai: { id: 'userLevel.category.ai', defaultMessage: 'AI 创作' },
  growth: { id: 'userLevel.category.growth', defaultMessage: '成长任务' },
  general: { id: 'userLevel.category.general', defaultMessage: '其他' },
};

function groupActions(actions) {
  const map = new Map();
  actions.forEach((a) => {
    const key = a.category || 'general';
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key);
    if (list) list.push(a);
  });
  return map;
}

const UserLevelPage = () => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [levels, setLevels] = useState([]);
  const [logs, setLogs] = useState([]);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, cfgs, logList] = await Promise.all([
          getUserLevelOverview(),
          getUserLevelConfigs(),
          getUserExpLogs(30),
        ]);
        setOverview(ov);
        setLevels(cfgs);
        setLogs(logList);
      } catch {
        /* handled by empty state */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actionGroups = useMemo(
    () => groupActions(overview?.actionProgress || []),
    [overview?.actionProgress]
  );

  const localeIsZh = intl.locale?.startsWith('zh');

  const pickName = (zh, en) => (localeIsZh ? zh : en || zh) || '';

  if (loading) {
    return (
      <PageWrap $token={token}>
        <SimpleHeader />
        <div style={{ textAlign: 'center', padding: 120 }}>
          <Spin size="large" />
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap $token={token}>
      <SimpleHeader />
      <Content>
        <HeroCard $token={token} $accent={token.colorPrimary} $badgeColor={overview?.badgeColor}>
          <div className="hero-row">
            <Avatar src={userInfo.avatar} size={64} icon={<TrophyOutlined />} />
            <div className="level-badge" style={{ background: overview?.badgeColor || token.colorPrimary }}>
              Lv.{overview?.currentLevel || 1}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Title level={3} style={{ margin: 0 }}>
                {pickName(overview?.levelName, overview?.levelNameEn) || intl.formatMessage({ id: 'userLevel.title', defaultMessage: '创作者等级' })}
              </Title>
              <Text type="secondary">
                <FormattedMessage id="userLevel.totalExp" defaultMessage="累计经验" />: {overview?.totalExp ?? 0}
              </Text>
              <div style={{ marginTop: 12 }}>
                <Progress
                  percent={overview?.progressPercent ?? 0}
                  strokeColor={overview?.badgeColor || token.colorPrimary}
                  format={() =>
                    overview?.expToNextLevel > 0
                      ? intl.formatMessage(
                          { id: 'userLevel.expToNext', defaultMessage: '还差 {exp} 经验升级' },
                          { exp: overview?.expToNextLevel }
                        )
                      : intl.formatMessage({ id: 'userLevel.maxLevel', defaultMessage: '已达最高等级' })
                  }
                />
              </div>
              {overview?.loginStreak > 0 && (
                <Tag icon={<FireOutlined />} color="orange" style={{ marginTop: 8 }}>
                  <FormattedMessage
                    id="userLevel.loginStreak"
                    defaultMessage="连续登录 {days} 天"
                    values={{ days: overview.loginStreak }}
                  />
                </Tag>
              )}
            </div>
          </div>
        </HeroCard>

        <Tabs
          defaultActiveKey="privileges"
          items={[
            {
              key: 'privileges',
              label: intl.formatMessage({ id: 'userLevel.tab.privileges', defaultMessage: '当前权益' }),
              children: (
                <Card>
                  {overview?.privileges?.length ? (
                    <Row gutter={[12, 12]}>
                      {overview.privileges.map((p) => (
                        <Col xs={24} sm={12} md={8} key={p.privilegeCode}>
                          <ActionItem $token={token} $accent={token.colorPrimary}>
                            <div className="title-row">
                              <Text strong>{pickName(p.privilegeName, p.privilegeNameEn)}</Text>
                              <GiftOutlined style={{ color: token.colorPrimary }} />
                            </div>
                            <Text type="secondary">{p.privilegeValue}</Text>
                            {p.description && (
                              <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0, fontSize: 12 }}>
                                {p.description}
                              </Paragraph>
                            )}
                          </ActionItem>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty description={intl.formatMessage({ id: 'userLevel.noPrivileges', defaultMessage: '暂无权益配置' })} />
                  )}
                </Card>
              ),
            },
            {
              key: 'actions',
              label: intl.formatMessage({ id: 'userLevel.tab.actions', defaultMessage: '获取经验' }),
              children: (
                <div>
                  {Array.from(actionGroups.entries()).map(([category, items]) => (
                    <Card
                      key={category}
                      title={
                        CATEGORY_LABELS[category]
                          ? intl.formatMessage(CATEGORY_LABELS[category])
                          : category
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <ActionGrid>
                        {items.map((a) => (
                          <ActionItem key={a.actionCode} $token={token} $accent={token.colorPrimary}>
                            <div className="title-row">
                              <Text strong>{pickName(a.name, a.nameEn)}</Text>
                              <span className="exp">+{a.expValue}</span>
                            </div>
                            {a.dailyLimit > 0 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <FormattedMessage
                                  id="userLevel.dailyProgress"
                                  defaultMessage="今日 {count}/{limit}"
                                  values={{ count: a.todayCount, limit: a.dailyLimit }}
                                />
                              </Text>
                            )}
                          </ActionItem>
                        ))}
                      </ActionGrid>
                    </Card>
                  ))}
                </div>
              ),
            },
            {
              key: 'levels',
              label: intl.formatMessage({ id: 'userLevel.tab.levels', defaultMessage: '等级阶梯' }),
              children: (
                <Card>
                  {levels.map((lv) => (
                    <LevelStep
                      key={lv.levelNum}
                      $token={token}
                      $accent={token.colorPrimary}
                      $active={lv.levelNum === overview?.currentLevel}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <CrownOutlined style={{ color: lv.badgeColor || token.colorPrimary }} />
                        <Text strong>
                          Lv.{lv.levelNum} {pickName(lv.name, lv.nameEn)}
                        </Text>
                        <Tag>{lv.minExp} EXP</Tag>
                        {lv.levelNum === overview?.currentLevel && (
                          <Tag color="processing">
                            <FormattedMessage id="userLevel.current" defaultMessage="当前" />
                          </Tag>
                        )}
                      </div>
                      {lv.privileges?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {lv.privileges.map((p) => (
                            <Tag key={p.privilegeCode} icon={<ThunderboltOutlined />}>
                              {pickName(p.privilegeName, p.privilegeNameEn)}: {p.privilegeValue}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </LevelStep>
                  ))}
                </Card>
              ),
            },
            {
              key: 'logs',
              label: intl.formatMessage({ id: 'userLevel.tab.logs', defaultMessage: '经验记录' }),
              children: (
                <Card>
                  {logs.length ? (
                    <Timeline
                      items={logs.map((log) => ({
                        color: 'blue',
                        children: (
                          <div>
                            <Text strong>{log.actionName || log.actionCode}</Text>
                            <Text type="success" style={{ marginLeft: 8 }}>+{log.expDelta}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{log.createTime}</Text>
                          </div>
                        ),
                      }))}
                    />
                  ) : (
                    <Empty description={intl.formatMessage({ id: 'userLevel.noLogs', defaultMessage: '暂无经验记录' })} />
                  )}
                </Card>
              ),
            },
          ]}
        />
      </Content>
    </PageWrap>
  );
};

export default UserLevelPage;
