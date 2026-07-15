import React, { useState } from 'react';
import { Button, Modal, Space, Tag, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { VIDEO_EDIT_EXAMPLE_PROMPTS, VideoEditExampleKey } from './constants';

const { Text, Paragraph } = Typography;

const TriggerBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 12px;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'};
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e8ecf1')};

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const GuideCard = styled.div<{ $accent: string }>`
  border-radius: 14px;
  padding: 14px 16px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'};
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e8ecf1')};
  border-top: 3px solid ${(p) => p.$accent};
`;

const GuideTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.92)' : '#0f172a')};
`;

const GuideDesc = styled(Text)`
  display: block;
  font-size: 12px;
  margin-bottom: 10px;
`;

const TagRow = styled(Space)`
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const PromptPreview = styled(Paragraph)`
  && {
    font-size: 12px;
    line-height: 1.55;
    margin-bottom: 10px;
    max-height: 120px;
    overflow: auto;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : '#475569')};
  }
`;

interface CapabilityGuideProps {
  onApplyExample: (prompt: string) => void;
}

const CARDS: Array<{
  key: VideoEditExampleKey;
  accent: string;
  titleId: string;
  titleDefault: string;
  descId: string;
  descDefault: string;
  tags: Array<{ id: string; defaultMessage: string }>;
}> = [
  {
    key: 'multimodal',
    accent: '#13c2c2',
    titleId: 'create.videoEdit.guide.multimodal.title',
    titleDefault: '多模态参考',
    descId: 'create.videoEdit.guide.multimodal.desc',
    descDefault: '组合参考视频、图片与音频，特征精细保持，按 Prompt 中的 @素材 引用生成。',
    tags: [
      { id: 'create.videoEdit.guide.tag.featureKeep', defaultMessage: '特征精细保持' },
      { id: 'create.videoEdit.guide.tag.combo', defaultMessage: '组合参考' },
      { id: 'create.videoEdit.guide.tag.videoRef', defaultMessage: '视频参考' },
      { id: 'create.videoEdit.guide.tag.imageRef', defaultMessage: '图片参考' },
      { id: 'create.videoEdit.guide.tag.gen', defaultMessage: '参考生成' },
    ],
  },
  {
    key: 'edit',
    accent: '#722ed1',
    titleId: 'create.videoEdit.guide.edit.title',
    titleDefault: '视频编辑',
    descId: 'create.videoEdit.guide.edit.desc',
    descDefault: '精准定向修改：主体替换、对象增删改、局部重绘/修复，动作与运镜可保持不变。',
    tags: [
      { id: 'create.videoEdit.guide.tag.precise', defaultMessage: '精准定向修改' },
      { id: 'create.videoEdit.guide.tag.replace', defaultMessage: '主体替换' },
      { id: 'create.videoEdit.guide.tag.addRemove', defaultMessage: '对象增删改' },
      { id: 'create.videoEdit.guide.tag.repaint', defaultMessage: '局部重绘/修复' },
    ],
  },
  {
    key: 'extend',
    accent: '#1890ff',
    titleId: 'create.videoEdit.guide.extend.title',
    titleDefault: '视频延长',
    descId: 'create.videoEdit.guide.extend.desc',
    descDefault: '无缝连贯叙事：以前序视频为轨道起点，用提示词补全后续镜头与氛围。',
    tags: [
      { id: 'create.videoEdit.guide.tag.seamless', defaultMessage: '无缝连贯叙事' },
      { id: 'create.videoEdit.guide.tag.prefix', defaultMessage: '前序生成' },
      { id: 'create.videoEdit.guide.tag.track', defaultMessage: '轨道补全' },
    ],
  },
];

const CapabilityGuide: React.FC<CapabilityGuideProps> = ({ onApplyExample }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const handleApply = (prompt: string) => {
    onApplyExample(prompt);
    setOpen(false);
  };

  return (
    <>
      <TriggerBar>
        <Text type="secondary" style={{ fontSize: 13, flex: 1, minWidth: 0 }}>
          <FormattedMessage
            id="create.videoEdit.guide.introShort"
            defaultMessage="支持多模态参考、视频编辑与延长。Prompt 中用 @视频1、@图像1、@音频1 引用素材。"
          />
        </Text>
        <Button type="default" icon={<BookOutlined />} onClick={() => setOpen(true)}>
          <FormattedMessage
            id="create.videoEdit.guide.open"
            defaultMessage="查看使用教程"
          />
        </Button>
      </TriggerBar>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="min(960px, calc(100vw - 32px))"
        centered
        destroyOnClose
        title={
          <FormattedMessage
            id="create.videoEdit.guide.modalTitle"
            defaultMessage="Seedance 视频剪辑教程"
          />
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 14, fontSize: 13 }}>
          <FormattedMessage
            id="create.videoEdit.guide.intro"
            defaultMessage="上传参考视频（必填）后，可组合图片与音频。Prompt 中用 @视频1、@图像1、@音频1 引用素材顺序。以下场景均走 Seedance 2 同一套多模态能力。"
          />
        </Text>
        <GuideGrid>
          {CARDS.map((card) => (
            <GuideCard key={card.key} $accent={card.accent}>
              <GuideTitle>
                <FormattedMessage id={card.titleId} defaultMessage={card.titleDefault} />
              </GuideTitle>
              <GuideDesc type="secondary">
                <FormattedMessage id={card.descId} defaultMessage={card.descDefault} />
              </GuideDesc>
              <TagRow size={[4, 4]} wrap>
                {card.tags.map((tag) => (
                  <Tag key={tag.id} color={card.accent} style={{ marginInlineEnd: 0 }}>
                    <FormattedMessage id={tag.id} defaultMessage={tag.defaultMessage} />
                  </Tag>
                ))}
              </TagRow>
              <PromptPreview>{VIDEO_EDIT_EXAMPLE_PROMPTS[card.key]}</PromptPreview>
              <Button
                size="small"
                type="primary"
                ghost
                onClick={() => handleApply(VIDEO_EDIT_EXAMPLE_PROMPTS[card.key])}
              >
                {intl.formatMessage({
                  id: 'create.videoEdit.guide.apply',
                  defaultMessage: '填入示例提示词',
                })}
              </Button>
            </GuideCard>
          ))}
        </GuideGrid>
      </Modal>
    </>
  );
};

export default CapabilityGuide;
