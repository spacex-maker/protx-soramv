import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import styled from 'styled-components';
import { auth } from '../api/auth';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f5f5f5'};
`;

const LoadingText = styled.div`
  margin-top: 24px;
  font-size: 16px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'};
`;

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        message.error('授权失败：未获取到授权码');
        navigate('/login');
        return;
      }

      try {
        const result = await auth.handleGoogleAuth({
          code,
          redirectUri: window.location.origin + '/auth/google/callback',
          state
        });

        if (result.success) {
          message.success('登录成功');
          navigate('/workspace');
        } else {
          message.error(result.message || '登录失败');
          navigate('/login');
        }
      } catch (error) {
        message.error('登录失败，请重试');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <Container>
      {loading && (
        <>
          <Spin size="large" />
          <LoadingText>正在处理谷歌登录...</LoadingText>
        </>
      )}
    </Container>
  );
};

export default GoogleCallback;

