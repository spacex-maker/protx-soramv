import styled from 'styled-components';
import { Tabs, Button } from 'antd';

// Layout
export const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-top: 80px;
`;

export const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px 60px;

  @media (max-width: 768px) {
    padding: 0 16px 40px;
  }
`;

// Hero Section
export const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  margin-top: 24px;
  margin-bottom: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  background: #000;

  @media (max-width: 768px) {
    height: 240px;
    border-radius: 16px;
  }
`;

export const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  
  background: linear-gradient(135deg, 
    #ff6b6b 0%,
    #ee5a6f 15%,
    #c44569 30%,
    #8b2f5b 45%,
    #6a1b9a 60%,
    #4a148c 75%,
    #1a237e 90%,
    #0d47a1 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 15s ease infinite;
  
  ${props => props.src ? `
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
    opacity: 0.9;
    filter: blur(2px) brightness(0.8);
    transform: scale(1.05);
    animation: none;
  ` : ''}
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(255, 107, 107, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 60%);
    pointer-events: none;
    animation: shimmer 10s ease-in-out infinite;
    ${props => props.src ? 'display: none;' : ''}
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: shine 8s linear infinite;
    pointer-events: none;
    ${props => props.src ? 'display: none;' : ''}
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes shine {
    0% { background-position: -200% -200%; }
    100% { background-position: 200% 200%; }
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1);

  &.live {
    background: rgba(82, 196, 26, 0.9);
    border-color: transparent;
  }
  
  &.ended {
    background: rgba(0, 0, 0, 0.6);
  }
`;

export const ChallengeTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 16px;
  }
`;

// Layout Grid
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div`
  min-width: 0;
`;

export const SideColumn = styled.div`
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

// Cards
export const DetailCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  
  .card-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const MarkdownContent = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  word-break: break-word;
  
  p {
    margin: 12px 0;
    line-height: 1.8;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 20px 0 12px 0;
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
    line-height: 1.4;
  }
  
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  h3 { font-size: 20px; }
  h4 { font-size: 18px; }
  h5 { font-size: 16px; }
  h6 { font-size: 14px; }
  
  strong, b {
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
  
  em, i {
    font-style: italic;
  }
  
  ul, ol {
    margin: 12px 0 16px 0;
    padding-left: 28px;
    
    li {
      margin: 6px 0;
      color: inherit;
      line-height: 1.6;
    }
  }
  
  ul {
    list-style: disc;
  }
  
  ol {
    list-style: decimal;
  }
  
  code {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }
  
  pre {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    
    code {
      background: transparent;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 4px solid ${props => props.theme.mode === 'dark' ? '#555' : '#ddd'};
    padding-left: 16px;
    margin: 16px 0;
    color: ${props => props.theme.mode === 'dark' ? '#bbb' : '#666'};
    font-style: italic;
  }
  
  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  hr {
    border: none;
    border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
    margin: 24px 0;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    
    th, td {
      border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
      font-weight: 600;
    }
  }
`;

export const PrizeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};

  &:last-child {
    border-bottom: none;
  }

  .rank {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: ${props => props.theme.mode === 'dark' ? '#222' : '#f5f5f5'};
      color: #666;
    }
    
    &.gold .icon { background: #fff1b8; color: #faad14; }
    &.silver .icon { background: #e6e6e6; color: #8c8c8c; }
    &.bronze .icon { background: #fcece3; color: #d46b08; }
  }

  .value {
    font-weight: 700;
    font-size: 16px;
  }
`;

// Prize Pool Header - 总奖池展示
export const PrizePoolHeader = styled.div`
  position: relative;
  margin-bottom: 24px;
  text-align: center;
  padding: 24px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, 
    rgba(250, 173, 20, 0.15) 0%, 
    rgba(255, 215, 0, 0.1) 50%, 
    rgba(250, 173, 20, 0.15) 100%
  );
  border: 2px solid rgba(250, 173, 20, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: rotate(0deg); opacity: 0.5; }
    50% { transform: rotate(180deg); opacity: 1; }
  }
  
  .total-label {
    position: relative;
    z-index: 1;
    font-size: 11px;
    color: #d48806;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
    opacity: 0.9;
  }
  
  .total-amount {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
    
    .amount {
      font-size: 36px;
      font-weight: 900;
      background: linear-gradient(135deg, #d46b08 0%, #faad14 50%, #ffd700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      letter-spacing: -1px;
    }
    
    .unit {
      font-size: 14px;
      font-weight: 600;
      color: #d48806;
      opacity: 0.8;
    }
  }
  
  .total-subtitle {
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
    font-weight: 500;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(250, 173, 20, 0.2);
    border-color: rgba(250, 173, 20, 0.5);
  }
`;

// Prize Rank List - 排名列表容器
export const PrizeRankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Prize Rank Item - 单个排名项
export const PrizeRankItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.5s ease-out both;
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: ${props => {
      if (props.className === 'gold') return 'rgba(255, 215, 0, 0.4)';
      if (props.className === 'silver') return 'rgba(192, 192, 192, 0.4)';
      if (props.className === 'bronze') return 'rgba(205, 127, 50, 0.4)';
      return props.theme.mode === 'dark' ? '#444' : '#d9d9d9';
    }};
  }
  
  .rank-info {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    
    .rank-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .rank-label {
        font-size: 15px;
        font-weight: 600;
        color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
      }
      
      .rank-percentage {
        font-size: 12px;
        font-weight: 500;
        color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
      }
    }
  }
  
  .rank-value {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    
    .value-number {
      font-size: 20px;
      font-weight: 800;
      color: ${props => {
        if (props.className === 'gold') return '#faad14';
        if (props.className === 'silver') return '#8c8c8c';
        if (props.className === 'bronze') return '#d46b08';
        return props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f';
      }};
      line-height: 1;
    }
    
    .value-unit {
      font-size: 11px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  &.gold {
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(250, 173, 20, 0.05) 100%)' 
      : 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 237, 78, 0.04) 100%)'};
  }
  
  &.silver {
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(232, 232, 232, 0.05) 100%)' 
      : 'linear-gradient(135deg, rgba(192, 192, 192, 0.08) 0%, rgba(232, 232, 232, 0.04) 100%)'};
  }
  
  &.bronze {
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(230, 160, 87, 0.05) 100%)' 
      : 'linear-gradient(135deg, rgba(205, 127, 50, 0.08) 0%, rgba(230, 160, 87, 0.04) 100%)'};
  }
`;

// Medal Icon - 奖牌图标
export const MedalIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.gradient || '#f5f5f5'};
  color: ${props => {
    if (props.className === 'gold') return '#d46b08';
    if (props.className === 'silver') return '#595959';
    if (props.className === 'bronze') return '#8b4513';
    return '#666';
  }};
  font-size: 24px;
  box-shadow: 0 4px 12px ${props => props.glow || 'rgba(0,0,0,0.1)'}, 
              0 0 0 2px ${props => {
    if (props.className === 'gold') return 'rgba(255, 215, 0, 0.3)';
    if (props.className === 'silver') return 'rgba(192, 192, 192, 0.3)';
    if (props.className === 'bronze') return 'rgba(205, 127, 50, 0.3)';
    return 'transparent';
  }};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: ${props => props.gradient || 'transparent'};
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
    filter: blur(8px);
  }
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 20px ${props => props.glow || 'rgba(0,0,0,0.15)'}, 
                0 0 0 3px ${props => {
      if (props.className === 'gold') return 'rgba(255, 215, 0, 0.5)';
      if (props.className === 'silver') return 'rgba(192, 192, 192, 0.5)';
      if (props.className === 'bronze') return 'rgba(205, 127, 50, 0.5)';
      return 'transparent';
    }};
    
    &::before {
      opacity: 0.6;
    }
  }
  
  svg {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
`;

export const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

export const ArtCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  break-inside: avoid;
  border: 1px solid rgba(255,255,255,0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    
    .overlay { opacity: 1; }
  }

  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 16px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 500;
    font-size: 13px;
  }

  .stats {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    padding: 4px 8px;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

export const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    
    &::before { border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'}; }
  }

  .ant-tabs-tab {
    padding: 12px 0;
    margin: 0 32px 0 0;
    font-size: 16px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
    
    &:hover { color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#333'}; }
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
      font-weight: 600;
    }
  }
`;

export const DrawerItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#e6f7ff') : 'transparent'};
  border: 1px solid ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bae7ff') : 'transparent'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => !props.active && (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')};
    transform: translateY(-2px);
  }

  .thumb-container {
    width: 100px;
    height: 72px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    background: #333;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
  }

  &:hover .thumb-container img {
      transform: scale(1.1);
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .meta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    
    .status-badge {
       display: flex;
       align-items: center;
       gap: 6px;
       font-size: 10px;
       font-weight: 700;
       text-transform: uppercase;
       padding: 2px 8px;
       border-radius: 100px;
       background: rgba(255,255,255,0.1);
       
       .dot {
           width: 6px;
           height: 6px;
           border-radius: 50%;
       }
    }
    
    .date {
        font-size: 11px;
        color: #888;
    }
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-bottom {
     display: flex;
     align-items: center;
     gap: 12px;
     font-size: 11px;
     color: #888;
     
     .tag {
         display: flex;
         align-items: center;
         gap: 4px;
         background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
         padding: 2px 8px;
         border-radius: 4px;
     }
  }
`;

// Share Card Styles
export const ShareCardContainer = styled.div`
  width: 100%;
`;

export const ShareButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: ${props => props.theme.mode === 'dark' ? '#555' : '#1890ff'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 24px;
    transition: transform 0.2s;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
  
  &.copy-link {
    &:hover {
      border-color: #52c41a;
      color: #52c41a;
    }
  }
  
  &.wechat {
    &:hover {
      border-color: #07c160;
      color: #07c160;
    }
  }
  
  &.weibo {
    &:hover {
      border-color: #e6162d;
      color: #e6162d;
    }
  }
  
  &.twitter {
    &:hover {
      border-color: #1da1f2;
      color: #1da1f2;
    }
  }
  
  &.facebook {
    &:hover {
      border-color: #1877f2;
      color: #1877f2;
    }
  }
  
  &.qrcode {
    &:hover {
      border-color: #722ed1;
      color: #722ed1;
    }
  }
  
  span {
    font-size: 12px;
    white-space: nowrap;
  }
`;

export const ShareLinkInput = styled.div`
  .ant-input {
    border-radius: 8px;
    font-size: 13px;
  }
`;

// QRCodeModal styles are applied via className in ShareCard component

export const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
`;

// Navigation Drawer Styles
export const DrawerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'};
  overflow: hidden;
`;

export const DrawerHeader = styled.div`
  padding: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  position: sticky;
  top: 0;
  z-index: 10;
  
  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      display: flex;
      align-items: center;
    }
    
    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border-radius: 8px;
      cursor: pointer;
      color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
      transition: all 0.2s;
      
      &:hover {
        background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      }
    }
  }
`;

export const DrawerSearchWrapper = styled.div`
  margin-bottom: 20px;
  
  .search-input {
    border-radius: 12px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
    transition: all 0.2s;
    
    &:hover {
      border-color: ${props => props.theme.mode === 'dark' ? '#444' : '#1890ff'};
    }
    
    &:focus, &.ant-input-focused {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
    
    .ant-input {
      background: transparent;
      color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
      
      &::placeholder {
        color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
      }
    }
  }
`;

export const DrawerStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      font-size: 20px;
      font-weight: 800;
      color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      
      &.active {
        color: #52c41a;
      }
      
      &.prize {
        color: #faad14;
      }
    }
    
    .stat-label {
      font-size: 12px;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  .stat-divider {
    width: 1px;
    height: 32px;
    background: ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  }
`;

export const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  align-items: stretch;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#333' : '#d9d9d9'};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#444' : '#bfbfbf'};
    }
  }
`;

export const ChallengeCard = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.active 
    ? (props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff') 
    : (props.theme.mode === 'dark' ? '#1a1a1a' : '#fff')};
  border: 2px solid ${props => props.active 
    ? (props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.4)' : '#91d5ff') 
    : (props.theme.mode === 'dark' ? '#333' : '#e8e8e8')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInRight 0.4s ease-out both;
  overflow: hidden;
  min-height: 112px;
  flex-shrink: 0;
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.active ? '#1890ff' : 'transparent'};
    transition: all 0.3s;
  }
  
  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-color: ${props => props.active 
      ? (props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.6)' : '#69c0ff') 
      : (props.theme.mode === 'dark' ? '#444' : '#d9d9d9')};
    
    &::before {
      width: 4px;
    }
  }
  
  .active-mark {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1890ff;
    border-radius: 50%;
    color: #fff;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
    animation: pulse 2s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
  }
`;

export const CardSettingsButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#595959'};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.92)'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;

  &:hover {
    color: #1890ff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
  }
`;

export const ChallengeThumb = styled.div`
  width: 120px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f0f0f0'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .thumb-overlay {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(8px);
    border: 1px solid;
    
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    
    @keyframes pulse-dot {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(0.9);
      }
    }
  }
  
  ${ChallengeCard}:hover & {
    img {
      transform: scale(1.1);
    }
  }
`;

export const ActiveIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
`;

export const ChallengeInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
  justify-content: flex-start;
`;

export const ChallengeMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .meta-left {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
    
    .challenge-id {
      font-weight: 700;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    }
    
    .date {
      font-weight: 500;
    }
  }
`;

export const DrawerChallengeTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
  
  ${ChallengeCard}:hover & {
    color: #1890ff;
  }
`;

export const ChallengeTags = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow: hidden;
  min-width: 0;
`;

export const ChallengeTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  flex-shrink: 0;
  
  svg {
    font-size: 14px;
    flex-shrink: 0;
  }
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: ${props => props.className === 'model' ? '120px' : 'none'};
  }
  
  &.prize {
    background: rgba(250, 173, 20, 0.15);
    color: #faad14;
    border: 1px solid rgba(250, 173, 20, 0.3);
    
    &:hover {
      background: rgba(250, 173, 20, 0.25);
    }
  }
  
  &.model {
    background: rgba(24, 144, 255, 0.15);
    color: #1890ff;
    border: 1px solid rgba(24, 144, 255, 0.3);
    flex: 0 1 auto;
    min-width: 0;
    max-width: 180px;
    
    &:hover {
      background: rgba(24, 144, 255, 0.25);
    }
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  
  .empty-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    margin-bottom: 24px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
    font-size: 36px;
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  }
`;

// Action Card Styles
export const ActionCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const CountdownSection = styled.div`
  text-align: center;
  padding: 24px 20px;
  border-radius: 16px;
  background: ${props => {
    if (props.className === 'live') {
      return props.theme.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.15) 0%, rgba(56, 158, 13, 0.08) 100%)'
        : 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(56, 158, 13, 0.05) 100%)';
    } else if (props.className === 'upcoming') {
      return props.theme.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(9, 109, 217, 0.08) 100%)'
        : 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(9, 109, 217, 0.05) 100%)';
    } else {
      return props.theme.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(136, 136, 136, 0.1) 0%, rgba(102, 102, 102, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(136, 136, 136, 0.08) 0%, rgba(102, 102, 102, 0.04) 100%)';
    }
  }};
  border: 2px solid ${props => {
    if (props.className === 'live') {
      return props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.3)' : 'rgba(82, 196, 26, 0.2)';
    } else if (props.className === 'upcoming') {
      return props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.3)' : 'rgba(24, 144, 255, 0.2)';
    } else {
      return props.theme.mode === 'dark' ? 'rgba(136, 136, 136, 0.2)' : 'rgba(136, 136, 136, 0.15)';
    }
  }};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => {
      if (props.className === 'live') {
        return 'radial-gradient(circle, rgba(82, 196, 26, 0.1) 0%, transparent 70%)';
      } else if (props.className === 'upcoming') {
        return 'radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%)';
      }
      return 'transparent';
    }};
    animation: ${props => props.className === 'live' || props.className === 'upcoming' ? 'pulse-glow 3s ease-in-out infinite' : 'none'};
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.className === 'live') {
        return '0 8px 24px rgba(82, 196, 26, 0.2)';
      } else if (props.className === 'upcoming') {
        return '0 8px 24px rgba(24, 144, 255, 0.2)';
      }
      return '0 4px 12px rgba(0,0,0,0.1)';
    }};
  }
`;

export const CountdownLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => {
    // 根据父元素的 className 设置颜色
    const parent = props.className || '';
    if (parent.includes('live')) return '#52c41a';
    if (parent.includes('upcoming')) return '#1890ff';
    return props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  }};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
  
  svg {
    font-size: 14px;
  }
`;

export const CountdownDisplay = styled.div`
  position: relative;
  z-index: 1;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CountdownValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  
  &.closed {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  }
`;

export const ActionButton = styled(Button)`
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  ${props => props.gradient && !props.disabled ? `
    background: ${props.gradient} !important;
    border: none !important;
  ` : ''}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &.active {
    animation: button-pulse 2s ease-in-out infinite;
  }
  
  @keyframes button-pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
    }
    50% {
      box-shadow: 0 4px 20px rgba(82, 196, 26, 0.5);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .anticon {
    font-size: 18px;
  }
`;

export const ActionTip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  transition: all 0.2s;
  
  svg {
    font-size: 14px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  }
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  }
`;

export const HubHeader = styled.div`
  margin: 16px 0 24px;

  .hub-title-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .hub-icon {
    font-size: 36px;
    color: #faad14;
    margin-top: 4px;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 800;
    color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  }

  p {
    margin: 0;
    font-size: 15px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'};
    max-width: 640px;
  }
`;

export const HubStats = styled(DrawerStats)`
  margin-bottom: 20px;
`;

export const HubToolbar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  .ant-input-affix-wrapper {
    flex: 1;
    min-width: 220px;
    max-width: 480px;
  }
`;

export const HubGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 8px;

  ${ChallengeCard} {
    flex-direction: column;
    animation-name: hubCardIn;
    min-height: 0;

    @keyframes hubCardIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    &:hover {
      transform: translateY(-4px);
    }

    ${ChallengeThumb} {
      width: 100%;
      height: 140px;
    }
  }
`;

