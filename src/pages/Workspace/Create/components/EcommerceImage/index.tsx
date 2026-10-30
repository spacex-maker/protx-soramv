import React, { useMemo, useState } from 'react';
import { ArrowRightOutlined, ShoppingOutlined } from '@ant-design/icons';
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
  margin-bottom: 32px;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ScenarioCard = styled.button<{ $accent?: string; $cover?: string }>`
  position: relative;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: #1c1917;
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${(p) => p.$cover || ''});
    background-size: cover;
    background-position: center;
    transform: scale(1);
    transition: transform 0.45s ease;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(12, 10, 9, 0.05) 0%,
      rgba(12, 10, 9, 0.35) 42%,
      rgba(12, 10, 9, 0.92) 100%
    );
    z-index: 1;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: ${(p) => `${p.$accent || '#c45c26'}aa`};
    box-shadow: 0 16px 36px -20px ${(p) => `${p.$accent || '#c45c26'}99`};
  }

  &:hover::before {
    transform: scale(1.06);
  }
`;

const CardBody = styled.div`
  position: relative;
  z-index: 2;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
  letter-spacing: -0.01em;
`;

const CardDesc = styled.div`
  font-size: 12.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.9em;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
`;

const GlassPill = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
`;

const CardCta = styled.span<{ $accent?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 650;
  color: ${(p) => p.$accent || '#fdba74'};
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
              defaultMessage="按运营场景选模板，上传商品图并填写策略即可出图；提示词在后台自动拼装，无需手写。"
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
                  $cover={scenario.coverImage}
                  onClick={() => setSelectedId(scenario.id)}
                >
                  <CardBody>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDesc>{scenario.description}</CardDesc>
                    <CardMeta>
                      {scenario.tags?.slice(0, 3).map((tag) => (
                        <GlassPill key={tag}>{tag}</GlassPill>
                      ))}
                    </CardMeta>
                    <CardCta $accent={category.accent}>
                      开始创作
                      <ArrowRightOutlined />
                    </CardCta>
                  </CardBody>
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