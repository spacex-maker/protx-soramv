import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Tag, theme } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DownOutlined,
  UpOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { CATEGORY_META, DIFFICULTY_META } from '../data';

const Card = styled.article`
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  border-radius: 16px;
  padding: 22px 22px 16px;
  box-shadow: 0 8px 28px ${(p) => (p.$isDark ? 'rgba(0,0,0,0.25)' : 'rgba(28, 39, 51, 0.04)')};
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${(p) => p.$token.colorBorder};
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const IndexBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: ${(p) => p.$token.colorText};
  color: ${(p) => p.$token.colorBgContainer};
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const Stem = styled.h3`
  margin: 0 0 14px;
  font-size: 17px;
  line-height: 1.7;
  color: ${(p) => p.$token.colorText};
  font-weight: 650;
  font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif;
`;

const CodeBlock = styled.pre`
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${(p) => (p.$isDark ? '#0b1220' : '#1c2733')};
  color: #e8eef5;
  border: 1px solid ${(p) => (p.$isDark ? p.$token.colorBorderSecondary : 'transparent')};
  font-family: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  tab-size: 4;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionBtn = styled.button`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  border: 1.5px solid ${(p) => p.$border || p.$token.colorBorderSecondary};
  background: ${(p) => p.$bg || p.$token.colorBgContainer};
  color: ${(p) => p.$token.colorText};
  padding: 12px 14px;
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  transition: all 0.18s ease;
  font-size: 15px;
  line-height: 1.55;

  &:hover {
    border-color: ${(p) => (p.$disabled ? p.$border || p.$token.colorBorderSecondary : p.$token.colorPrimary)};
    transform: ${(p) => (p.$disabled ? 'none' : 'translateY(-1px)')};
  }

  .key {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    background: ${(p) => p.$keyBg || p.$token.colorFillSecondary};
    color: ${(p) => p.$keyColor || p.$token.colorText};
  }

  .text {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .text.code {
    font-family: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
    font-size: 12.5px;
    line-height: 1.65;
    background: ${(p) => p.$token.colorFillTertiary};
    border-radius: 8px;
    padding: 8px 10px;
    white-space: pre;
    overflow-x: auto;
  }
`;

const ResultBar = styled.div`
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => (p.$ok ? p.$token.colorSuccess : p.$token.colorError)};
`;

const SolutionToggle = styled.button`
  margin-top: 14px;
  width: 100%;
  border: 1px dashed ${(p) => p.$token.colorBorder};
  background: ${(p) => p.$token.colorFillTertiary};
  color: ${(p) => p.$token.colorTextSecondary};
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s ease;

  &:hover {
    background: ${(p) => p.$token.colorFillSecondary};
    color: ${(p) => p.$token.colorText};
  }
`;

const SolutionBody = styled.div`
  margin-top: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${(p) => p.$token.colorSuccessBg};
  border: 1px solid ${(p) => p.$token.colorSuccessBorder};
  color: ${(p) => p.$token.colorText};
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .answer-line {
    font-weight: 700;
    color: ${(p) => p.$token.colorSuccess};
    margin-bottom: 8px;
  }

  .knowledge {
    margin-top: 10px;
    font-size: 13px;
    color: ${(p) => p.$token.colorTextSecondary};
  }
`;

function looksLikeCode(text = '') {
  const t = String(text);
  if (t.includes('\n')) return true;
  return /^(def |import |from |include |print\(|for |while |if |elif |else:|ok\s*=|count\s*=|s\s*=|a\s*=|b\s*=|n\s*=|x\s*=|y\s*=|swap\()/m.test(t.trim())
    || t.includes('lambda ')
    || /return\s+/.test(t);
}

function optionStyle(key, answered, userChoice, correctAnswer, token) {
  if (!answered) {
    return {};
  }
  if (key === correctAnswer) {
    return {
      $disabled: true,
      $border: token.colorSuccessBorder,
      $bg: token.colorSuccessBg,
      $keyBg: token.colorSuccess,
      $keyColor: '#fff',
    };
  }
  if (key === userChoice && userChoice !== correctAnswer) {
    return {
      $disabled: true,
      $border: token.colorErrorBorder,
      $bg: token.colorErrorBg,
      $keyBg: token.colorError,
      $keyColor: '#fff',
    };
  }
  return { $disabled: true };
}

const QuestionCard = ({
  question,
  index,
  userChoice,
  onAnswer,
}) => {
  const { token } = theme.useToken();
  const themeCtx = useContext(ThemeContext);
  const darkMode = themeCtx?.mode === 'dark';
  const [openSolution, setOpenSolution] = useState(false);
  const answered = Boolean(userChoice);
  const isCorrect = answered && userChoice === question.answer;
  const cat = CATEGORY_META[question.category] || { label: question.category, color: 'default' };
  const diff = DIFFICULTY_META[question.difficulty] || { label: '练习', color: 'default' };

  return (
    <Card $token={token} $isDark={darkMode}>
      <MetaRow>
        <IndexBadge $token={token}>{index}</IndexBadge>
        <Tag color={cat.color}>{cat.label}</Tag>
        <Tag color={diff.color}>{diff.label}</Tag>
        {question.knowledge && (
          <Tag icon={<BookOutlined />} color="default">{question.knowledge}</Tag>
        )}
      </MetaRow>

      <Stem $token={token}>{question.stem}</Stem>

      {question.code && (
        <CodeBlock $token={token} $isDark={darkMode}>{question.code}</CodeBlock>
      )}

      <Options>
        {question.options.map((opt) => {
          const styles = optionStyle(opt.key, answered, userChoice, question.answer, token);
          const codeOpt = looksLikeCode(opt.text);
          return (
            <OptionBtn
              key={opt.key}
              type="button"
              $token={token}
              $disabled={answered}
              disabled={answered}
              onClick={() => onAnswer?.(question.id, opt.key)}
              {...styles}
            >
              <span className="key">{opt.key}</span>
              <span className={`text${codeOpt ? ' code' : ''}`}>{opt.text}</span>
            </OptionBtn>
          );
        })}
      </Options>

      {answered && (
        <ResultBar $token={token} $ok={isCorrect}>
          {isCorrect ? <CheckCircleFilled /> : <CloseCircleFilled />}
          {isCorrect ? '回答正确' : `回答错误，正确答案是 ${question.answer}`}
        </ResultBar>
      )}

      <SolutionToggle
        type="button"
        $token={token}
        onClick={() => setOpenSolution((v) => !v)}
      >
        <span>{openSolution ? '收起详细题解' : '点击查看详细题解'}</span>
        {openSolution ? <UpOutlined /> : <DownOutlined />}
      </SolutionToggle>

      {openSolution && (
        <SolutionBody $token={token}>
          <div className="answer-line">正确答案：{question.answer}</div>
          <div>{question.explanation}</div>
          {question.knowledge && (
            <div className="knowledge">考点：{question.knowledge}</div>
          )}
        </SolutionBody>
      )}
    </Card>
  );
};

export default QuestionCard;
