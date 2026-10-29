import React, { useMemo, useState } from 'react';
import { CheckCircleOutlined, PictureOutlined, ShoppingOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ECOMMERCE_CATEGORIES, findEcommerceScenario } from './scenarios';
import ScenarioWorkbench from './ScenarioWorkbench';

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
  background: radial-gradient(1200px 280px at 12% -20%, rgba(196, 92, 38, 0.28), transparent 55%),
    radial-gradient(900px 240px at 88% 0%, rgba(15, 118, 110, 0.18), transparent 50%);
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

const CategoryChip = styled.button<{ $active?: boolean; $accent?: string }>`
  border: 1px solid ${(p) => (p.$active ? p.$accent || '#c45c26' : 'rgba(255,255,255,0.12)')};
  background: ${(p) => (p.$active ? `${p.$accent || '#c45c26'}22` : 'rgba(255,255,255,0.04)')};
  color: ${(p) => (p.$active ? p.$accent || '#fdba74' : 'rgba(255,255,255,0.75)')};
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: ${(p) => p.$accent || '#c45c26'};
  }
`;

const Section = styled.section`
  margin-bottom: 28px;
`;

const SectionHead = styled.div`
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2<{ $accent?: string }>`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => p.$accent || '#f59e0b'};
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background: ${(p) => p.$accent || '#c45c26'};
  }
`;

const SectionSub = styled.p`
  margin: 0;
  padding-left: 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const ScenarioCard = styled.button<{ $accent?: string }>`
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
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
    border-color: ${(p) => `${p.$accent || '#c45c26'}99`};
    box-shadow: 0 12px 28px -18px ${(p) => `${p.$accent || '#c45c26'}88`};
  }
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 650;
  color: #fafaf9;
  line-height: 1.35;
`;

const CardDesc = styled.div`
  flex: 1;
  font-size: 12.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.5);
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
  padding: 3px 8px;
  border-radius: 999px;
  background: ${(p) => (p.$tone === 'mode' ? 'rgba(253,186,116,0.15)' : 'rgba(255,255,255,0.06)')};
  color: rgba(255, 255, 255, 0.75);
`;

const WorkbenchWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 14px;
`;

const EcommerceImage: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
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
        <WorkbenchWrap>
          <ScenarioWorkbench category={category} scenario={scenario} onBack={() => setSelectedId(null)} />
        </WorkbenchWrap>
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
            <FormattedMessage id="create.ecommerce.title" defaultMessage="电商视觉工作台" />
          </HeroTitle>
          <HeroDesc>
            <FormattedMessage
              id="create.ecommerce.subtitle"
              defaultMessage="按运营场景选模板，上传商品图并填写属性即可出图——提示词在后台自动拼装，无需手写。"
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

        {visibleCategories.map((category) => (
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
                      <PictureOutlined /> Klein 图生图
                    </MetaPill>
                    {scenario.tags?.slice(0, 2).map((tag) => (
                      <MetaPill key={tag} $tone="tag">
                        {tag}
                      </MetaPill>
                    ))}
                    <MetaPill $tone="tag">
                      <CheckCircleOutlined />
                      <FormattedMessage id="create.ecommerce.select" defaultMessage="进入工作台" />
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
