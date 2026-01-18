import React from 'react';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import MediaTools from '../Workspace/MediaTools';
import SEO, { SEOConfigs } from 'components/SEO';
import styled from 'styled-components';

const { Content } = Layout;

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#f5f5f7'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
  font-family: "SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
`;

const MainContent = styled(Content)`
  height: calc(100vh - 64px);
  margin-top: 64px;
  padding: 0;
  background: transparent;
  overflow: hidden;
`;

const MediaToolsPage = () => {
  const intl = useIntl();

  return (
    <PageContainer>
      <SEO 
        title={intl.formatMessage({ 
          id: 'mediaToolsPage.title', 
          defaultMessage: '媒体工具 - Sora MV' 
        })}
        description={intl.formatMessage({ 
          id: 'mediaToolsPage.description', 
          defaultMessage: '专业的在线媒体处理工具，支持图片压缩、视频压缩等多种功能' 
        })}
      />
      <Helmet>
        <title>{intl.formatMessage({ 
          id: 'mediaToolsPage.title', 
          defaultMessage: '媒体工具 - Sora MV' 
        })}</title>
        <meta 
          name="description" 
          content={intl.formatMessage({ 
            id: 'mediaToolsPage.description', 
            defaultMessage: '专业的在线媒体处理工具，支持图片压缩、视频压缩等多种功能' 
          })}
        />
      </Helmet>
      <SimpleHeader />
      <Layout style={{ background: 'transparent', height: '100vh' }}>
        <MainContent>
          <MediaTools />
        </MainContent>
      </Layout>
    </PageContainer>
  );
};

export default MediaToolsPage;

