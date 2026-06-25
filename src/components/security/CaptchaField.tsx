import React, { useCallback, useEffect, useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import { fetchCaptcha } from 'api/captcha';

interface PillBarProps {
  $focused?: boolean;
}

/** 与登录页用户名/密码一致的圆弧形长条容器 */
const PillBar = styled.div<PillBarProps>`
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 52px;
  border-radius: 9999px;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'var(--ant-color-border)'
    : '#e5e7eb'};
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : '#f9fafb'};
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: background 0.3s, border-color 0.3s;

  ${props => props.$focused && css`
    border-color: transparent;
    background: ${props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : '#ffffff'};
  `}

  @media (max-width: 768px) {
    min-height: 48px;
  }
`;

const ImageZone = styled.button`
  position: relative;
  flex: 0 0 38%;
  align-self: stretch;
  min-width: 0;
  min-height: 52px;
  padding: 0;
  margin: 0;
  border: none;
  background: #f4f6f9;
  cursor: pointer;
  overflow: hidden;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .captcha-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f4f6f9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }

  @media (max-width: 768px) {
    flex: 0 0 36%;
    min-height: 48px;
  }
`;

const CodeInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 1rem 0.75rem;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  font-size: 1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    padding: 0.875rem 0.65rem;
    font-size: 16px;
  }

  &:focus {
    outline: none;
  }

  &::placeholder {
    letter-spacing: normal;
    text-transform: none;
    color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(0, 0, 0, 0.25)'};
  }
`;

const RefreshZone = styled.button`
  flex: 0 0 48px;
  width: 48px;
  border: none;
  background: transparent;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: color 0.2s, background 0.2s;

  &:hover:not(:disabled) {
    color: var(--ant-color-primary);
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.08)'
      : 'rgba(59, 130, 246, 0.06)'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (max-width: 768px) {
    flex: 0 0 48px;
    width: 48px;
  }
`;

/* 非登录页备用：分离式布局 */
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const ImageButton = styled.button`
  flex-shrink: 0;
  width: 112px;
  height: 44px;
  padding: 0;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'var(--ant-color-border)'
    : '#e5e7eb'};
  border-radius: 10px;
  background: #f4f6f9;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const RefreshButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'var(--ant-color-border)'
    : '#e5e7eb'};
  border-radius: 10px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : '#f9fafb'};
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary-border);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StandaloneInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'var(--ant-color-border)'
    : '#e5e7eb'};
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : '#f9fafb'};
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  font-size: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;

  &:focus {
    outline: none;
    border-color: var(--ant-color-primary);
  }

  &::placeholder {
    letter-spacing: normal;
    text-transform: none;
    color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(0, 0, 0, 0.25)'};
  }
`;

interface CaptchaFieldProps {
  captchaId: string;
  captchaCode: string;
  onCaptchaIdChange: (id: string) => void;
  onCaptchaCodeChange: (code: string) => void;
  onRegisterRefresh?: (refresh: () => void) => void;
  /** pill：与登录页输入框一致的圆弧形长条 */
  variant?: 'default' | 'pill';
  onFocusChange?: (focused: boolean) => void;
}

const CaptchaField: React.FC<CaptchaFieldProps> = ({
  captchaId,
  captchaCode,
  onCaptchaIdChange,
  onCaptchaCodeChange,
  onRegisterRefresh,
  variant = 'pill',
  onFocusChange,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [imageBase64, setImageBase64] = useState('');
  const [focused, setFocused] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCaptcha();
      if (res?.success && res.data) {
        onCaptchaIdChange(res.data.captchaId);
        onCaptchaCodeChange('');
        setImageBase64(res.data.imageBase64);
      }
    } catch (error) {
      console.error('Failed to load captcha:', error);
    } finally {
      setLoading(false);
    }
  }, [onCaptchaIdChange, onCaptchaCodeChange]);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  useEffect(() => {
    onRegisterRefresh?.(loadCaptcha);
  }, [loadCaptcha, onRegisterRefresh]);

  const handleFocus = () => {
    setFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setFocused(false);
    onFocusChange?.(false);
  };

  if (variant === 'pill') {
    return (
      <PillBar $focused={focused}>
        <ImageZone
          type="button"
          onClick={loadCaptcha}
          disabled={loading}
          title={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
          aria-label={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
        >
          {loading ? (
            <span className="captcha-loading">
              <Spin size="small" />
            </span>
          ) : (
            imageBase64 ? <img src={imageBase64} alt="" /> : null
          )}
        </ImageZone>
        <CodeInput
          type="text"
          value={captchaCode}
          onChange={(e) => onCaptchaCodeChange(e.target.value.trim())}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={intl.formatMessage({ id: 'captcha.placeholder', defaultMessage: '人机验证码' })}
          maxLength={8}
          autoComplete="off"
          name="captcha"
          required
        />
        <RefreshZone
          type="button"
          onClick={loadCaptcha}
          disabled={loading}
          title={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
          aria-label={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
        >
          <ReloadOutlined />
        </RefreshZone>
        {!captchaId && !loading && (
          <span style={{ display: 'none' }} data-testid="captcha-missing" />
        )}
      </PillBar>
    );
  }

  return (
    <Row>
      <ImageButton
        type="button"
        onClick={loadCaptcha}
        disabled={loading}
        title={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
        aria-label={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
      >
        {loading ? <Spin size="small" /> : (
          imageBase64 ? <img src={imageBase64} alt="" /> : null
        )}
      </ImageButton>
      <StandaloneInput
        type="text"
        value={captchaCode}
        onChange={(e) => onCaptchaCodeChange(e.target.value.trim())}
        placeholder={intl.formatMessage({ id: 'captcha.placeholder', defaultMessage: '人机验证码' })}
        maxLength={8}
        autoComplete="off"
        name="captcha"
        required
      />
      <RefreshButton
        type="button"
        onClick={loadCaptcha}
        disabled={loading}
        title={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
        aria-label={intl.formatMessage({ id: 'captcha.refresh', defaultMessage: '刷新验证码' })}
      >
        <ReloadOutlined />
      </RefreshButton>
    </Row>
  );
};

export default CaptchaField;
