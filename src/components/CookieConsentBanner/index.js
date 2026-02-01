import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

const COOKIE_CONSENT_KEY = 'cookieConsent';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 16px 24px;
  background: ${(p) => (p.$dark ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)')};
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)')};
  box-shadow: 0 -2px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const Text = styled.span`
  flex: 1;
  min-width: 200px;
  font-size: 14px;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const Btn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  &.primary {
    background: #3b82f6;
    color: #fff;
  }
  &.default {
    background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')};
    color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)')};
  }
  &.link {
    background: transparent;
    color: #3b82f6;
    text-decoration: underline;
  }
`;

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [dark, setDark] = useState(false);
  const intl = useIntl();
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setDark(theme === 'dark');
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    setVisible(false);
  };

  const essentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setVisible(false);
  };

  const openSettings = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'pending');
    setVisible(false);
    navigate('/privacy-preferences');
  };

  if (!visible) return null;

  return (
    <Banner $dark={dark}>
      <Text>
        {intl.formatMessage({ id: 'cookieBanner.message' })}
      </Text>
      <Buttons>
        <Btn type="button" className="link" $dark={dark} onClick={openSettings}>
          {intl.formatMessage({ id: 'cookieBanner.settings' })}
        </Btn>
        <Btn type="button" className="default" $dark={dark} onClick={essentialOnly}>
          {intl.formatMessage({ id: 'cookieBanner.essentialOnly' })}
        </Btn>
        <Btn type="button" className="primary" onClick={acceptAll}>
          {intl.formatMessage({ id: 'cookieBanner.acceptAll' })}
        </Btn>
      </Buttons>
    </Banner>
  );
}
