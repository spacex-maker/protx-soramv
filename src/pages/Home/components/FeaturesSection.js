import React, { useContext, useState, useEffect } from 'react';
import styled, { ThemeContext, keyframes, css } from 'styled-components';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle, BentoCard } from '../styles';
import { PlayCircleFilled, ThunderboltFilled, AppstoreFilled, BulbOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';

// 网格布局
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 500px 400px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

// 卡片内容样式
const CardContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;

  h3 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    background: linear-gradient(to right, #fff, #ccc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 17px;
    color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }

  .icon-bg {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 200px;
    opacity: 0.03;
    transform: rotate(-15deg);
  }
`;

// 特定卡片背景
const LargeCard = styled(BentoCard)`
  grid-column: span 2;
  background: radial-gradient(circle at top right, #1e1e24, #000);
  
  @media (max-width: 1024px) { grid-column: span 1; }
`;

const MediaCard = styled(BentoCard)`
  background-image: ${props => props.$bgImage ? `url('${props.$bgImage}')` : 'none'};
  background-size: cover;
  background-position: center;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  }
`;

const VideoCard = styled(BentoCard)`
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    z-index: 1;
  }
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 0;
`;

// 光标闪烁动画
const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

// 按钮点击动画
const clickPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

// AI思考动画（加载点）
const loadingDots = keyframes`
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
`;

// 模拟演示容器
const DemoContainer = styled.div`
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-width: 500px;
  z-index: 3;
  opacity: 0.98;
  
  @media (max-width: 1024px) {
    top: 40%;
    width: 90%;
  }
`;

// 模拟输入框
const MockTextArea = styled.div`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  min-height: 120px;
  font-size: 15px;
  color: #fff;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

// 光标
const Cursor = styled.span`
  display: ${props => props.$show ? 'inline-block' : 'none'};
  width: 2px;
  height: 18px;
  background: #fff;
  margin-left: 2px;
  ${css`animation: ${blink} 1s infinite;`}
  vertical-align: text-bottom;
`;

// 模拟按钮容器
const MockButtonContainer = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

// 模拟按钮
const MockButton = styled.div`
  padding: 10px 20px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${props => props.$active 
    ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.2)'};
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.15)'};
  
  ${props => props.$clicking && css`
    animation: ${clickPulse} 0.3s ease;
  `}
  
  ${props => props.$loading && css`
    &::after {
      content: '';
      animation: ${loadingDots} 1.5s infinite;
    }
  `}
`;

// AI生成提示
const AIThinking = styled.div`
  position: absolute;
  top: -35px;
  right: 0;
  background: rgba(102, 126, 234, 0.95);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(102, 126, 234, 0.95);
  }
`;

// AI提示词演示组件
const AIPromptDemo = () => {
  const intl = useIntl();
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showAIThinking, setShowAIThinking] = useState(false);
  const [stage, setStage] = useState('typing'); // typing, clicking, thinking, result, pause

  // 从国际化文件获取示例文本
  const promptExamples = {
    userInput: intl.formatMessage({ 
      id: 'home.features.demo.userInput', 
      defaultMessage: '一只猫' 
    }),
    aiResult: intl.formatMessage({ 
      id: 'home.features.demo.aiResult', 
      defaultMessage: '一只优雅的波斯猫，柔软蓬松的白色长毛，琥珀色的大眼睛，坐在洒满阳光的窗台上。背景是淡蓝色的天空和飘动的白色窗帘。4K高清，电影级光影，景深效果，专业摄影。' 
    }),
    buttonText: intl.formatMessage({ 
      id: 'home.features.demo.buttonText', 
      defaultMessage: 'AI 生成提示词' 
    }),
    buttonLoading: intl.formatMessage({ 
      id: 'home.features.demo.buttonLoading', 
      defaultMessage: 'AI 生成中' 
    }),
    thinkingText: intl.formatMessage({ 
      id: 'home.features.demo.thinkingText', 
      defaultMessage: 'AI 正在创作✨' 
    })
  };

  useEffect(() => {
    let timer;
    let isMounted = true;

    const runDemo = async () => {
      if (!isMounted) return;
      
      const { userInput, aiResult } = promptExamples;
      
      // 阶段1: 用户输入（打字机效果）
      setStage('typing');
      setDisplayText('');
      setShowCursor(true);
      
      for (let i = 0; i <= userInput.length; i++) {
        if (!isMounted) return;
        await new Promise(resolve => setTimeout(resolve, 150)); // 每个字150ms
        if (!isMounted) return;
        setDisplayText(userInput.slice(0, i));
      }
      
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 800)); // 输入完成后停顿

      // 阶段2: 点击按钮
      if (!isMounted) return;
      setStage('clicking');
      setShowCursor(false);
      setIsClicking(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!isMounted) return;
      setIsClicking(false);

      // 阶段3: AI思考中
      if (!isMounted) return;
      setStage('thinking');
      setIsThinking(true);
      setShowAIThinking(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // AI思考1.5秒
      if (!isMounted) return;
      setIsThinking(false);
      setShowAIThinking(false);

      // 阶段4: 显示AI结果（快速打字）
      if (!isMounted) return;
      setStage('result');
      setDisplayText('');
      setShowCursor(true);
      
      for (let i = 0; i <= aiResult.length; i++) {
        if (!isMounted) return;
        await new Promise(resolve => setTimeout(resolve, 30)); // AI回答快一些，30ms
        if (!isMounted) return;
        setDisplayText(aiResult.slice(0, i));
      }
      
      if (!isMounted) return;
      setShowCursor(false);
      
      // 阶段5: 停顿，让用户看清结果
      setStage('pause');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 停顿3秒

      // 循环
      if (isMounted) {
        runDemo();
      }
    };

    runDemo();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [promptExamples.userInput, promptExamples.aiResult]);

  return (
    <DemoContainer>
      <MockTextArea>
        {displayText}
        <Cursor $show={showCursor} />
      </MockTextArea>
      <MockButtonContainer>
        <MockButton
          $active={true}
          $clicking={isClicking}
          $loading={isThinking}
          style={{ position: 'relative' }}
        >
          <AIThinking $show={showAIThinking}>{promptExamples.thinkingText}</AIThinking>
          <BulbOutlined style={{ fontSize: 16 }} />
          {isThinking ? promptExamples.buttonLoading : promptExamples.buttonText}
        </MockButton>
      </MockButtonContainer>
    </DemoContainer>
  );
};

const FeaturesSection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();
  const [bgImage, setBgImage] = useState('https://thumbs2.imgbox.com/75/53/9nbhQkxZ_t.png');
  const [videoUrl, setVideoUrl] = useState('https://files.catbox.moe/z4w7ez.mp4');

  useEffect(() => {
    // 预加载图片，如果失败则使用备用链接
    const img = new Image();
    const primaryUrl = 'https://thumbs2.imgbox.com/75/53/9nbhQkxZ_t.png';
    const fallbackUrl = 'https://t.tutu.to/md/nCtI4';
    
    img.onload = () => {
      setBgImage(primaryUrl);
    };
    
    img.onerror = () => {
      console.log('Primary image failed to load, using fallback');
      setBgImage(fallbackUrl);
    };
    
    img.src = primaryUrl;
  }, []);

  // 视频加载失败时的处理
  const handleVideoError = () => {
    console.log('Primary video failed to load, using fallback');
    setVideoUrl('https://public-1258150206.cos.ap-nanjing.myqcloud.com/home/generated_video%20%281%29.mp4');
  };

  return (
    <Section>
      <ContentWrapper>
        <SectionTitle theme={theme}>
          {intl.formatMessage({ 
            id: 'home.features.title', 
            defaultMessage: '全能创作工坊。' 
          })}
        </SectionTitle>
        <SectionSubtitle theme={theme}>
          {intl.formatMessage({ 
            id: 'home.features.subtitle', 
            defaultMessage: '不仅仅是生成视频，更是对创意的全方位赋能。' 
          })}
        </SectionSubtitle>
        
        <Grid>
          {/* 大卡片 1 */}
          <LargeCard theme={theme}>
            {/* AI提示词演示 */}
            <AIPromptDemo />
            
            <CardContent>
              <ThunderboltFilled className="icon-bg" />
              <h3>
                {intl.formatMessage({ 
                  id: 'home.features.aiPrompt.title', 
                  defaultMessage: '不会写提示词？AI 帮你写' 
                })}
              </h3>
              <p>
                {intl.formatMessage({ 
                  id: 'home.features.aiPrompt.description', 
                  defaultMessage: '完全没灵感？一键让 AI 帮你写。随便打几个词，AI 自动润色成影视级描述，10 秒出片。想改风格？再点一次，秒变赛博/油画/二次元。' 
                })}
              </p>
            </CardContent>
          </LargeCard>

          {/* 视觉卡片 */}
          <MediaCard theme={theme} $bgImage={bgImage}>
            <CardContent>
              <h3>
                {intl.formatMessage({ 
                  id: 'home.features.quality.title', 
                  defaultMessage: '电影级画质' 
                })}
              </h3>
              <p>
                {intl.formatMessage({ 
                  id: 'home.features.quality.description', 
                  defaultMessage: '原生支持 4K 分辨率输出，每一帧都细腻如画。' 
                })}
              </p>
            </CardContent>
          </MediaCard>

          {/* 视频卡片 */}
          <VideoCard theme={theme}>
            <BackgroundVideo 
              key={videoUrl}
              autoPlay 
              loop 
              muted 
              playsInline
              onError={handleVideoError}
            >
              <source src={videoUrl} type="video/mp4" />
            </BackgroundVideo>
            <CardContent>
              <PlayCircleFilled className="icon-bg" style={{ fontSize: 150 }} />
              <h3>
                {intl.formatMessage({ 
                  id: 'home.features.imageToVideo.title', 
                  defaultMessage: '图生视频' 
                })}
              </h3>
              <p>
                {intl.formatMessage({ 
                  id: 'home.features.imageToVideo.description', 
                  defaultMessage: '上传一张静态图片，AI 将理解画面中的光影与物理关系，自动推演后续动态，让照片活过来。' 
                })}
              </p>
            </CardContent>
          </VideoCard>

          {/* 大卡片 2 */}
          <LargeCard theme={theme} style={{ background: 'radial-gradient(circle at bottom left, #2a2a35, #000)' }}>
            <CardContent>
              <AppstoreFilled className="icon-bg" />
              <h3>
                {intl.formatMessage({ 
                  id: 'home.features.multimodal.title', 
                  defaultMessage: '多模态生态' 
                })}
              </h3>
              <p>
                {intl.formatMessage({ 
                  id: 'home.features.multimodal.description', 
                  defaultMessage: '不仅支持 Stable Diffusion 文生图，更集成了 Midjourney 风格迁移与 ElevenLabs 音频合成。在一个工作流中完成所有创作。' 
                })}
              </p>
            </CardContent>
          </LargeCard>
        </Grid>
      </ContentWrapper>
    </Section>
  );
};

export default FeaturesSection;