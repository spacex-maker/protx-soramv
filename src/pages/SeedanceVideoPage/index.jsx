import React from 'react';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import SeedanceVideo from 'pages/Workspace/Create/components/SeedanceVideo';

const { Content } = Layout;

const PageContent = styled(Content)`
  margin-top: 64px;
  height: calc(100vh - 64px);
  overflow: auto;
  padding: 24px;
  background: ${(props) => (props.theme?.mode === 'dark' ? '#0a0a0a' : '#f5f7fa')} !important;
`;

/**
 * Seedance 图生视频 - 独立整页，无侧栏
 * 路由：/seedance-video
 */
const SeedanceVideoPage = () => {
  return (
    <>
      <Helmet>
        <title>Seedance 图生视频 - AI2OBJ</title>
        <meta name="description" content="字节豆包 Seedance 1.5 图生视频" />
      </Helmet>
      <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
        <SimpleHeader />
        <PageContent>{<SeedanceVideo />}</PageContent>
      </Layout>
    </>
  );
};

export default SeedanceVideoPage;
