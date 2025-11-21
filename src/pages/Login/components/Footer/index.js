import React from 'react';
import { PhilosophyQuoteWrapper, PoweredByWrapper } from './styles';

export const PhilosophyQuote = ({ children }) => (
  <PhilosophyQuoteWrapper>
    {[...children].map((char, index) => (
      <span key={index}>{char}</span>
    ))}
  </PhilosophyQuoteWrapper>
);

export const PoweredBy = ({ children }) => (
  <PoweredByWrapper>
    {children}
  </PoweredByWrapper>
); 