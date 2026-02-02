import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ThunderboltOutlined } from '@ant-design/icons';

const Section = styled.section`
  padding: 80px 24px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled(motion.h2)`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  color: #fff;
  margin-bottom: 32px;
  letter-spacing: -0.02em;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled(motion.li)`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  &:last-child {
    border-bottom: none;
  }
`;

const IconWrap = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(p) => p.$accent}20;
  color: ${(p) => p.$accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const Text = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #b0b5ba;
  margin: 0;
`;

const CompanyHighlightsSection = ({ data, theme }) => {
  const accent = theme?.primary || '#00d4aa';
  const highlights = data.highlights || [];

  if (highlights.length === 0) return null;

  return (
    <Section>
      <Title
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        关键动态
      </Title>
      <List>
        {highlights.map((item, i) => (
          <Item
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <IconWrap $accent={accent}>
              <ThunderboltOutlined />
            </IconWrap>
            <Text>{item}</Text>
          </Item>
        ))}
      </List>
    </Section>
  );
};

export default CompanyHighlightsSection;
