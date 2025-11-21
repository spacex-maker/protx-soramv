import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FooterWrapper, Copyright, PhilosophyQuoteWrapper, PoweredByWrapper } from './styles';

export const Footer = () => {
  return (
    <FooterWrapper>
      <PhilosophyQuote>
        技术应是为人民服务
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