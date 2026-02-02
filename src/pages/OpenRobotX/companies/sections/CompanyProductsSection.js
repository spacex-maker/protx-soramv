import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RobotOutlined } from '@ant-design/icons';

const Section = styled.section`
  padding: 80px 24px;
  background: rgba(255, 255, 255, 0.02);
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Title = styled(motion.h2)`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  color: #fff;
  margin-bottom: 40px;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const Card = styled(motion.div)`
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: border-color 0.2s, background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${(p) => p.$accent}40;
  }
`;

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 16/10;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDesc = styled.p`
  font-size: 14px;
  color: #9aa0a6;
  line-height: 1.55;
  margin: 0;
`;

const CompanyProductsSection = ({ data, theme }) => {
  const accent = theme?.primary || '#00d4aa';
  const products = data.products || [];

  if (products.length === 0) return null;

  return (
    <Section>
      <Inner>
        <Title
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          代表产品
        </Title>
        <Grid>
          {products.map((product, i) => (
            <Card
              key={product.name}
              $accent={accent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {product.image && (
                <CardImage>
                  <img src={product.image} alt={product.name} loading="lazy" />
                </CardImage>
              )}
              <CardTitle>
                <RobotOutlined style={{ color: accent }} />
                {product.name}
              </CardTitle>
              <CardDesc>{product.description}</CardDesc>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
};

export default CompanyProductsSection;
