import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LeftSectionWrapper, WelcomeText } from './styles';

export const LeftSection = () => {
  return (
    <LeftSectionWrapper>
      <WelcomeText>
        <h1>
          <FormattedMessage id="login.welcome" />
        </h1>
        <p>
          <FormattedMessage id="login.description" />
        </p>
      </WelcomeText>
    </LeftSectionWrapper>
  );
}; 