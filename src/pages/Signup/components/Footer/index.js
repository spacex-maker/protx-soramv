import React from 'react';
import { useIntl } from 'react-intl';
import { FooterWrapper, Copyright, PhilosophyQuoteWrapper, PoweredByWrapper } from './styles';

export const Footer = () => {
  const intl = useIntl();
  return (
    <FooterWrapper>
      <PhilosophyQuote>
        {intl.formatMessage({ id: 'common.philosophy' })}
      </PhilosophyQuote>
      <PoweredBy>
        Powered by ProTX
      </PoweredBy>
    </FooterWrapper>
  );
};

export const PhilosophyQuote = ({ children }) => (
  <PhilosophyQuoteWrapper>
    {children.split('').map((char, index) => (
      <span key={index}>{char}</span>
    ))}
  </PhilosophyQuoteWrapper>
);

export const PoweredBy = ({ children }) => (
  <PoweredByWrapper>
    {children}
  </PoweredByWrapper>
); 