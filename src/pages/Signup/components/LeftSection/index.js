import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LeftSection as StyledLeftSection, WelcomeText, Description } from './styles';

export const LeftSection = () => {
  return (
    <StyledLeftSection>
      <WelcomeText>
        <h1>
          <FormattedMessage id="signup.welcome" />
        </h1>
      </WelcomeText>
      <Description>
        <FormattedMessage id="signup.description" />
      </Description>
    </StyledLeftSection>
  );
}; 