import React from 'react';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import SeedanceVideo from 'pages/Workspace/Create/components/SeedanceVideo';

const { Content } = Layout;

const BACKGROUND_VIDEO_URL =
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/47w9oml55hsav.mp4';

const VideoBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  & video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PageContent = styled(Content)`
  position: relative;
  z-index: 1;
  margin-top: 64px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1400px;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: auto;
  padding: 24px;
  /* 玻璃拟态：半透明 + 背景模糊 */
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
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
      <VideoBackdrop>
        <video
          src={BACKGROUND_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
      </VideoBackdrop>
      <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', background: 'transparent' }}>
        <SimpleHeader />
        <PageContent>{<SeedanceVideo />}</PageContent>
      </Layout>
    </>
  );
};

export default SeedanceVideoPage;
