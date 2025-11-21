import React, { useState } from 'react';
import { Layout, Tabs } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import TextToImage from './components/TextToImage';
import TextToVideo from './components/TextToVideo';
import ImageToImage from './components/ImageToImage';
import ImageToVideo from './components/ImageToVideo';

const { Content } = Layout;

const Create: React.FC = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('textToImage');

  const tabItems = [
    {
      key: 'textToImage',
      label: <FormattedMessage id="create.tab.textToImage" defaultMessage="文生图" />,
      children: <TextToImage />
    },
    {
      key: 'textToVideo',
      label: <FormattedMessage id="create.tab.textToVideo" defaultMessage="文生视频" />,
      children: <TextToVideo />
    },
    {
      key: 'imageToImage',
      label: <FormattedMessage id="create.tab.imageToImage" defaultMessage="图生图" />,
      children: <ImageToImage />
    },
    {
      key: 'imageToVideo',
      label: <FormattedMessage id="create.tab.imageToVideo" defaultMessage="图生视频" />,
      children: <ImageToVideo />
    }
  ];

  return (
    <Content style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '20px',
      background: 'transparent'
    }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        tabBarStyle={{
          marginBottom: '20px',
          background: 'transparent'
        }}
      />
    </Content>
  );
};

export default Create;

