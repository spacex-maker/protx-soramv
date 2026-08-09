import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes, ThemeContext } from 'styled-components';
import {
  Button,
  Progress,
  Select,
  Statistic,
  Modal,
  message,
  Empty,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  DatabaseOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  ClearOutlined,
  LeftOutlined,
  RightOutlined,
  FormOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import SimpleHeader from 'components/headers/simple';
import questionBank, {
  CATEGORY_META,
  DAILY_QUESTION_COUNT,
} from './data';
import {
  formatDateKey,
  getDailyQuestions,
  getQuestionsByCategory,
} from './dailyPicker';
import {
  loadProgress,
  recordAnswer,
  markDailyFinished,
  getWrongQuestionIds,
  clearProgress,
} from './storage';
import QuestionCard from './components/QuestionCard';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  background-color: ${(p) => p.$token.colorBgLayout};
  background-image:
    radial-gradient(ellipse 80% 50% at 10% -10%, ${(p) => p.$token.colorPrimary}18 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 90% 0%, ${(p) => p.$token.colorWarning}12 0%, transparent 50%);
  padding-top: 80px;
  font-family: "IBM Plex Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: ${(p) => p.$token.colorText};
`;

const Shell = styled.div`
  max-width: 880px;
  width: min(94%, 880px);
  margin: 0 auto 64px;
  animation: ${fadeUp} 0.45s ease;
`;

const Hero = styled.header`
  margin: 28px 0 22px;

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${(p) => p.$token.colorPrimary};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  h1 {
    margin: 0;
    font-size: clamp(28px, 4vw, 38px);
    line-height: 1.25;
    color: ${(p) => p.$token.colorText};
    font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif;
    font-weight: 700;
  }

  .desc {
    margin: 12px 0 0;
    color: ${(p) => p.$token.colorTextSecondary};
    font-size: 15px;
    line-height: 1.7;
    max-width: 640px;
  }
`;

const Panel = styled.section`
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 10px 30px ${(p) => (p.$isDark ? 'rgba(0,0,0,0.25)' : 'rgba(28, 39, 51, 0.04)')};
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const ModeTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  flex: 1;
  min-width: min(100%, 520px);
  padding: 6px;
  border-radius: 16px;
  background: ${(p) => p.$token.colorFillTertiary};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};

  @media (max-width: 640px) {
    min-width: 100%;
    grid-template-columns: 1fr;
  }
`;

const ModeTab = styled.button`
  appearance: none;
  border: 1px solid ${(p) => (p.$active ? p.$token.colorBorder : 'transparent')};
  background: ${(p) => (p.$active ? p.$token.colorBgContainer : 'transparent')};
  color: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorTextSecondary)};
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  box-shadow: ${(p) => (p.$active
    ? `0 6px 16px ${p.$isDark ? 'rgba(0,0,0,0.28)' : 'rgba(28, 39, 51, 0.08)'}`
    : 'none')};
  position: relative;

  &:hover {
    background: ${(p) => (p.$active ? p.$token.colorBgContainer : p.$token.colorFillSecondary)};
    color: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorText)};
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    line-height: 1.2;
  }

  .icon {
    width: 28px;
    height: 28px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => (p.$active ? p.$token.colorPrimaryBg : p.$token.colorFillSecondary)};
    color: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorTextSecondary)};
    font-size: 14px;
    flex-shrink: 0;
  }

  .meta {
    margin: 6px 0 0 36px;
    font-size: 12px;
    font-weight: 500;
    color: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorTextTertiary)};
    line-height: 1.35;
  }

  .badge {
    margin-left: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    background: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorWarning)};
    color: #fff;
  }

  .badge.muted {
    background: ${(p) => (p.$active ? p.$token.colorPrimaryBg : p.$token.colorFillSecondary)};
    color: ${(p) => (p.$active ? p.$token.colorPrimary : p.$token.colorTextSecondary)};
  }
`;

const ClearBtn = styled(Button)`
  && {
    height: auto;
    align-self: center;
    border-radius: 12px;
  }
`;

const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${(p) => p.$token.colorFillTertiary};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};

  .date-label {
    min-width: 120px;
    text-align: center;
    font-weight: 700;
    color: ${(p) => p.$token.colorText};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FinishBanner = styled.div`
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 14px;
  background: ${(p) => p.$token.colorSuccessBg};
  border: 1px solid ${(p) => p.$token.colorSuccessBorder};
  color: ${(p) => p.$token.colorSuccessText || p.$token.colorSuccess};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 600;
`;

const Tip = styled.p`
  margin: 10px 0 0;
  font-size: 13px;
  color: ${(p) => p.$token.colorTextTertiary};
`;

const CategorySelect = styled(Select)`
  && {
    width: 100%;
    max-width: 420px;
  }

  && .ant-select-selector {
    border-radius: 999px !important;
    height: 44px !important;
    padding: 0 18px !important;
    align-items: center;
    background: ${(p) => p.$token.colorFillTertiary} !important;
    border-color: ${(p) => p.$token.colorBorderSecondary} !important;
    box-shadow: none !important;
  }

  &&.ant-select-focused .ant-select-selector,
  &&:hover .ant-select-selector {
    border-color: ${(p) => p.$token.colorPrimary} !important;
  }

  && .ant-select-selection-item,
  && .ant-select-selection-placeholder {
    line-height: 42px !important;
    font-weight: 600;
  }

  && .ant-select-arrow {
    inset-inline-end: 16px;
  }
`;

const categoryDropdownStyles = {
  borderRadius: 22,
  overflow: 'hidden',
  padding: 6,
};

const CategoryDropdownGlobal = createGlobalStyle`
  .jiazi-category-dropdown.ant-select-dropdown {
    border-radius: 22px !important;
    padding: 6px !important;
  }

  .jiazi-category-dropdown .ant-select-item {
    border-radius: 999px !important;
    margin: 2px 0;
    padding-inline: 14px !important;
  }
`;

const TeacherCertPracticePage = () => {
  const { token } = theme.useToken();
  const themeCtx = useContext(ThemeContext);
  const darkMode = themeCtx?.mode === 'dark';

  const [mode, setMode] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(() => dayjs().startOf('day'));
  const [category, setCategory] = useState('all');
  const [progress, setProgress] = useState(() => loadProgress());
  const [choices, setChoices] = useState({});

  const dateKey = formatDateKey(selectedDate.toDate());
  const isToday = dateKey === formatDateKey(new Date());

  const dailyQuestions = useMemo(
    () => getDailyQuestions(selectedDate.toDate(), DAILY_QUESTION_COUNT),
    [selectedDate],
  );

  const bankQuestions = useMemo(
    () => getQuestionsByCategory(category),
    [category],
  );

  const wrongQuestions = useMemo(() => {
    const ids = getWrongQuestionIds();
    return ids
      .map((id) => questionBank.find((q) => q.id === id))
      .filter(Boolean);
  }, [progress]);

  const questions = mode === 'daily'
    ? dailyQuestions
    : mode === 'wrong'
      ? wrongQuestions
      : bankQuestions;

  useEffect(() => {
    const next = {};
    questions.forEach((q) => {
      const saved = progress.answers[q.id];
      if (saved?.choice) next[q.id] = saved.choice;
    });
    setChoices(next);
  }, [mode, dateKey, category, questions, progress.answers]);

  const answeredCount = questions.filter((q) => choices[q.id]).length;
  const correctCount = questions.filter(
    (q) => choices[q.id] && choices[q.id] === q.answer,
  ).length;
  const allDone = questions.length > 0 && answeredCount === questions.length;
  const percent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  useEffect(() => {
    if (mode === 'daily' && allDone) {
      markDailyFinished(dateKey, correctCount, questions.length);
      setProgress(loadProgress());
    }
  }, [mode, allDone, dateKey, correctCount, questions.length]);

  const handleAnswer = (id, choice) => {
    if (choices[id]) return;
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    const ok = choice === q.answer;
    setChoices((prev) => ({ ...prev, [id]: choice }));
    setProgress(recordAnswer(id, choice, ok));
    message.open({
      type: ok ? 'success' : 'error',
      content: ok ? '回答正确' : `回答错误，正确答案 ${q.answer}`,
      duration: 1.2,
    });
  };

  const handleClear = () => {
    Modal.confirm({
      title: '清空本地刷题记录？',
      content: '将清除作答记录、错题本与每日完成标记（仅本浏览器）。',
      okText: '清空',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        clearProgress();
        setProgress(loadProgress());
        setChoices({});
        message.success('已清空');
      },
    });
  };

  const totalAnswered = Object.keys(progress.answers).length;
  const totalCorrect = Object.values(progress.answers).filter((a) => a.correct).length;
  const dailyFinishedDays = Object.keys(progress.dailyDone).length;

  const categoryOptions = [
    { value: 'all', label: `全部题库（${questionBank.length}）` },
    ...Object.entries(CATEGORY_META).map(([key, meta]) => ({
      value: key,
      label: `${meta.label}（${questionBank.filter((q) => q.category === key).length}）`,
    })),
  ];

  return (
    <Page $token={token}>
      <CategoryDropdownGlobal />
      <SimpleHeader />
      <Shell>
        <Hero $token={token}>
          <div className="eyebrow">
            <BookOutlined /> 高中信息技术教资 · Python 专项
          </div>
          <h1>信息技术编程能力专项练习</h1>
          <p className="desc">
            面向编程基础较弱的考生：每天固定 {DAILY_QUESTION_COUNT} 题循序渐进，覆盖基础语法、分支循环、组合类型、函数文件、算法与读程填空。
            题解默认收起，点击后展开。进度保存在本浏览器，分享链接即可刷题。
          </p>
        </Hero>

        <Panel $token={token} $isDark={darkMode}>
          <StatsRow>
            <Statistic title="题库总量" value={questionBank.length} prefix={<DatabaseOutlined />} />
            <Statistic title="已作答" value={totalAnswered} prefix={<FireOutlined />} />
            <Statistic title="答对题数" value={totalCorrect} prefix={<TrophyOutlined />} />
            <Statistic title="完成天数" value={dailyFinishedDays} prefix={<CalendarOutlined />} />
          </StatsRow>
          <Tip $token={token}>
            建议节奏：先完成「今日练习」，错题进错题本复盘；周末用「全部题库」按模块查漏补缺。
          </Tip>
        </Panel>

        <Panel $token={token} $isDark={darkMode}>
          <Toolbar>
            <ModeTabs $token={token} role="tablist" aria-label="练习模式">
              <ModeTab
                type="button"
                role="tab"
                aria-selected={mode === 'daily'}
                $token={token}
                $isDark={darkMode}
                $active={mode === 'daily'}
                onClick={() => setMode('daily')}
              >
                <div className="row">
                  <span className="icon"><CalendarOutlined /></span>
                  今日练习
                  <span className="badge muted">{DAILY_QUESTION_COUNT}</span>
                </div>
                <div className="meta">按日期更新 · 每天一小口</div>
              </ModeTab>

              <ModeTab
                type="button"
                role="tab"
                aria-selected={mode === 'bank'}
                $token={token}
                $isDark={darkMode}
                $active={mode === 'bank'}
                onClick={() => setMode('bank')}
              >
                <div className="row">
                  <span className="icon"><DatabaseOutlined /></span>
                  全部题库
                  <span className="badge muted">{questionBank.length}</span>
                </div>
                <div className="meta">按模块筛选 · 查漏补缺</div>
              </ModeTab>

              <ModeTab
                type="button"
                role="tab"
                aria-selected={mode === 'wrong'}
                $token={token}
                $isDark={darkMode}
                $active={mode === 'wrong'}
                onClick={() => setMode('wrong')}
              >
                <div className="row">
                  <span className="icon"><FormOutlined /></span>
                  错题本
                  <span className={`badge${wrongQuestions.length ? '' : ' muted'}`}>
                    {wrongQuestions.length}
                  </span>
                </div>
                <div className="meta">
                  {wrongQuestions.length ? '优先复盘错题' : '暂无错题，继续保持'}
                </div>
              </ModeTab>
            </ModeTabs>

            <ClearBtn icon={<ClearOutlined />} onClick={handleClear}>
              清空记录
            </ClearBtn>
          </Toolbar>

          {mode === 'daily' && (
            <DateNav $token={token}>
              <Button
                icon={<LeftOutlined />}
                onClick={() => setSelectedDate((d) => d.subtract(1, 'day'))}
              >
                前一天
              </Button>
              <span className="date-label">
                {dateKey}{isToday ? '（今天）' : ''}
              </span>
              <Button
                icon={<RightOutlined />}
                disabled={isToday}
                onClick={() => setSelectedDate((d) => d.add(1, 'day'))}
              >
                后一天
              </Button>
              {!isToday && (
                <Button type="link" onClick={() => setSelectedDate(dayjs().startOf('day'))}>
                  回到今天
                </Button>
              )}
            </DateNav>
          )}

          {mode === 'bank' && (
            <CategorySelect
              $token={token}
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              size="large"
              popupMatchSelectWidth
              popupClassName="jiazi-category-dropdown"
              styles={{
                popup: {
                  root: categoryDropdownStyles,
                },
              }}
            />
          )}

          {mode === 'wrong' && wrongQuestions.length > 0 && (
            <Tip $token={token} style={{ marginTop: 0, marginBottom: 4 }}>
              错题来自历史作答记录，建议先独立再做一遍，再点开题解对照。
            </Tip>
          )}

          {questions.length > 0 && (
            <>
              <div style={{ marginTop: 14 }}>
                <Progress
                  percent={percent}
                  strokeColor={token.colorPrimary}
                  format={() => `${answeredCount}/${questions.length}`}
                />
              </div>
              {allDone && (
                <FinishBanner $token={token}>
                  <span>
                    本组已完成：正确 {correctCount}/{questions.length}
                    （正确率 {Math.round((correctCount / questions.length) * 100)}%）
                  </span>
                  {mode === 'daily' && (
                    <span>明天同一时间再来，题面会按日期自动更换。</span>
                  )}
                </FinishBanner>
              )}
            </>
          )}
        </Panel>

        <List>
          {questions.length === 0 ? (
            <Panel $token={token} $isDark={darkMode}>
              <Empty
                description={
                  mode === 'wrong'
                    ? '暂无错题，先去做今日练习吧'
                    : '暂无题目'
                }
              />
            </Panel>
          ) : (
            questions.map((q, idx) => (
              <QuestionCard
                key={`${mode}-${q.id}`}
                question={q}
                index={idx + 1}
                userChoice={choices[q.id]}
                onAnswer={handleAnswer}
              />
            ))
          )}
        </List>
      </Shell>
    </Page>
  );
};

export default TeacherCertPracticePage;
