import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Section = styled.section`
  padding: 80px 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled(motion.h2)`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
`;

const Paragraph = styled(motion.p)`
  font-size: 17px;
  line-height: 1.7;
  color: #b0b5ba;
  margin: 0 0 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const CompanyAboutSection = ({ data, theme }) => {
  const accent = theme?.primary || '#00d4aa';

  return (
    <Section>
      <Title
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 16 }}
      >
        关于 {data.name}
      </Title>
      {data.aboutParagraphs?.map((p, i) => (
        <Paragraph
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          {p}
        </Paragraph>
      ))}
    </Section>
  );
};

export default CompanyAboutSection;
