import React, { useMemo, useState } from 'react';
import {
  ArrowLeftOutlined,
  PictureOutlined,
  EditOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import TextToImage from '../TextToImage/TextToImage';
import ImageToImage from '../ImageToImage/ImageToImage';
import {
  ECOMMERCE_CATEGORIES,
  EcommerceCategory,
  EcommerceScenario,
  findEcommerceScenario,
} from './scenarios';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-bottom: 24px;
`;

const Hero = styled.header`
  position: relative;
  margin-bottom: 28px;
  padding: 28px 28px 32px;
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(1200px 280px at 12% -20%, rgba(196, 92, 38, 0.28), transparent 55%),
    radial-gradient(900px 240px at 88% 0%, rgba(15, 118, 110, 0.18), transparent 50%),
    linear-gradient(
      145deg,
      ${(p) => (p.theme?.mode === 'dark' ? '#1a1612' : '#1c1917')} 0%,
      ${(p) => (p.theme?.mode === 'dark' ? '#292524' : '#292524')} 55%,
      ${(p) => (p.theme?.mode === 'dark' ? '#1c1917' : '#44403c')} 100%
    );
  color: #fafaf9;
`;

const HeroBrand = styled.div`
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fdba74;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(26px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #fff7ed;
`;

const HeroDesc = styled.p`
  margin: 0;
  max-width: 720px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 247, 237, 0.72);
`;

const CategoryNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
`;

const CategoryChip = styled.button<{ $active?: boolean; $accent: string }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? p.$accent
        : p.theme?.mode === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.08)'};
  background: ${(p) =>
    p.$active
      ? `${p.$accent}18`
      : p.theme?.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : '#fff'};
  color: ${(p) =>
    p.$active
      ? p.$accent
      : p.theme?.mode === 'dark'
        ? 'rgba(255,255,255,0.75)'
        : 'rgba(0,0,0,0.72)'};
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: ${(p) => p.$accent};
    color: ${(p) => p.$accent};
  }
`;

const Section = styled.section`
  margin-bottom: 28px;
`;

const SectionHead = styled.div`
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2<{ $accent: string }>`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.theme?.mode === 'dark' ? '#f5f5f4' : '#1c1917')};
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background: ${(p) => p.$accent};
  }
`;

const SectionSub = styled.p`
  margin: 0;
  padding-left: 14px;
  font-size: 13px;
  color: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const ScenarioCard = styled.button<{ $accent: string }>`
  text-align: left;
  border: 1px solid
    ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(28,25,23,0.08)')};
  background: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff')};
  border-radius: 16px;
  padding: 16px 16px 14px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 168px;

  &:hover {
    transform: translateY(-2px);
    border-color: ${(p) => p.$accent}99;
    box-shadow: 0 12px 28px -18px ${(p) => p.$accent}88;
  }
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 650;
  color: ${(p) => (p.theme?.mode === 'dark' ? '#fafaf9' : '#1c1917')};
  line-height: 1.35;
`;

const CardDesc = styled.div`
  flex: 1;
  font-size: 12.5px;
  line-height: 1.55;
  color: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')};
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const MetaPill = styled.span<{ $tone?: 'mode' | 'tag' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${(p) =>
    p.$tone === 'mode'
      ? p.theme?.mode === 'dark'
        ? 'rgba(253,186,116,0.15)'
        : 'rgba(196,92,38,0.1)'
      : p.theme?.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.04)'};
  color: ${(p) =>
    p.$tone === 'mode'
      ? p.theme?.mode === 'dark'
        ? '#fdba74'
        : '#c45c26'
      : p.theme?.mode === 'dark'
        ? 'rgba(255,255,255,0.55)'
        : 'rgba(0,0,0,0.5)'};
`;

const Workbench = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 14px;
`;

const WorkbenchBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${(p) =>
    p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.03)'};
  border: 1px solid
    ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(28,25,23,0.06)')};
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)')};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  flex-shrink: 0;

  &:hover {
    color: #c45c26;
  }
`;

const WorkbenchInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const WorkbenchTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.theme?.mode === 'dark' ? '#fafaf9' : '#1c1917')};
`;

const WorkbenchSub = styled.div`
  margin-top: 4px;
  font-size: 12.5px;
  line-height: 1.5;
  color: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')};
`;

const Tips = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.55;
  color: ${(p) => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')};
`;

const ToolPane = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const modeLabel = (mode: EcommerceScenario['genMode'], intl: ReturnType<typeof useIntl>) =>
  mode === 'imageToImage'
    ? intl.formatMessage({ id: 'create.tab.imageToImage', defaultMessage: '图生图' })
    : intl.formatMessage({ id: 'create.tab.textToImage', defaultMessage: '文生图' });

const EcommerceImage: React.FC = () => {
  const intl = useIntl();
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? findEcommerceScenario(selectedId) : null),
    [selectedId],
  );

  const visibleCategories = useMemo(() => {
    if (activeCategoryId === 'all') return ECOMMERCE_CATEGORIES;
    return ECOMMERCE_CATEGORIES.filter((c) => c.id === activeCategoryId);
  }, [activeCategoryId]);

  if (selected) {
    const { category, scenario } = selected;
    return (
      <Page>
        <Workbench>
          <WorkbenchBar>
            <BackBtn type="button" onClick={() => setSelectedId(null)}>
              <ArrowLeftOutlined />
              <FormattedMessage id="create.ecommerce.back" defaultMessage="返回场景" />
            </BackBtn>
            <WorkbenchInfo>
              <WorkbenchTitle>
                {category.title} · {scenario.title}
              </WorkbenchTitle>
              <WorkbenchSub>{scenario.description}</WorkbenchSub>
              {scenario.tips.length > 0 && (
                <Tips>
                  {scenario.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </Tips>
              )}
            </WorkbenchInfo>
            <CardMeta>
              <MetaPill $tone="mode">
                {scenario.genMode === 'imageToImage' ? <PictureOutlined /> : <EditOutlined />}
                {modeLabel(scenario.genMode, intl)}
              </MetaPill>
              {scenario.tags?.slice(0, 3).map((tag) => (
                <MetaPill key={tag} $tone="tag">
                  {tag}
                </MetaPill>
              ))}
            </CardMeta>
          </WorkbenchBar>
          <ToolPane>
            {scenario.genMode === 'imageToImage' ? (
              <ImageToImage
                key={scenario.id}
                embedded
                embedConfig={{
                  initialPrompt: scenario.promptTemplate,
                  hideHeader: true,
                  preferredKleinMode: scenario.preferredKleinMode,
                  initialAspectRatio: scenario.aspectHint,
                }}
              />
            ) : (
              <TextToImage
                key={scenario.id}
                embedded
                variant="embed"
                embedConfig={{
                  initialPrompt: scenario.promptTemplate,
                  hideHeader: true,
                  initialAspectRatio: scenario.aspectHint,
                }}
              />
            )}
          </ToolPane>
        </Workbench>
      </Page>
    );
  }

  return (
    <Page>
      <Scroll>
        <Hero>
          <HeroBrand>
            <ShoppingOutlined />
            AIMATEX COMMERCE
          </HeroBrand>
          <HeroTitle>
            <FormattedMessage id="create.ecommerce.title" defaultMessage="电商生图" />
          </HeroTitle>
          <HeroDesc>
            <FormattedMessage
              id="create.ecommerce.subtitle"
              defaultMessage="从商品上架、内容种草、直播带货到跨境出海——选择场景，一键进入对应生图工作台。"
            />
          </HeroDesc>
        </Hero>

        <CategoryNav>
          <CategoryChip
            type="button"
            $active={activeCategoryId === 'all'}
            $accent="#c45c26"
            onClick={() => setActiveCategoryId('all')}
          >
            <FormattedMessage id="create.ecommerce.all" defaultMessage="全部场景" />
          </CategoryChip>
          {ECOMMERCE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              type="button"
              $active={activeCategoryId === cat.id}
              $accent={cat.accent}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.title}
            </CategoryChip>
          ))}
        </CategoryNav>

        {visibleCategories.map((category: EcommerceCategory) => (
          <Section key={category.id} id={`ecom-${category.id}`}>
            <SectionHead>
              <SectionTitle $accent={category.accent}>{category.title}</SectionTitle>
              <SectionSub>{category.subtitle}</SectionSub>
            </SectionHead>
            <Grid>
              {category.scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  type="button"
                  $accent={category.accent}
                  onClick={() => setSelectedId(scenario.id)}
                >
                  <CardTitle>{scenario.title}</CardTitle>
                  <CardDesc>{scenario.description}</CardDesc>
                  <CardMeta>
                    <MetaPill $tone="mode">
                      {scenario.genMode === 'imageToImage' ? (
                        <PictureOutlined />
                      ) : (
                        <EditOutlined />
                      )}
                      {modeLabel(scenario.genMode, intl)}
                    </MetaPill>
                    {scenario.tags?.slice(0, 2).map((tag) => (
                      <MetaPill key={tag} $tone="tag">
                        {tag}
                      </MetaPill>
                    ))}
                    <MetaPill $tone="tag">
                      <CheckCircleOutlined />
                      <FormattedMessage id="create.ecommerce.select" defaultMessage="选择" />
                    </MetaPill>
                  </CardMeta>
                </ScenarioCard>
              ))}
            </Grid>
          </Section>
        ))}
      </Scroll>
    </Page>
  );
};

export default EcommerceImage;
