import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: ${props => props.theme.mode};
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--ant-color-bg-container);
    color: var(--ant-color-text, ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'});
    min-height: 100vh;
  }

  * {
    box-sizing: border-box;
  }

  /* 确保暗色模式下的文本可见性 */
  .dark {
    color-scheme: dark;
  }

  #root {
    min-height: 100vh;
  }

  /* 模态框圆角样式 */
  .ant-modal .ant-modal-content {
    border-radius: 20px !important;
    overflow: hidden;
  }

  .ant-modal .ant-modal-header {
    border-radius: 20px 20px 0 0 !important;
  }

  /* Tooltip 样式 */
  .ant-tooltip .ant-tooltip-inner {
    min-width: 56px;
    min-height: 32px;
    padding: 6px 8px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
    text-align: start;
    text-decoration: none;
    word-wrap: break-word;
    background-color: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : '#fff'};
    border-radius: 20px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  .ant-tooltip .ant-tooltip-arrow-content {
    background-color: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : '#fff'};
  }

  /* Below animations are for modal created using React-Modal */
  .ReactModal__Overlay {
    transition: transform 300ms ease-in-out;
    transition-delay: 100ms;
    transform: scale(0);
    
    &--after-open {
      transform: scale(1);
    }
    
    &--before-close {
      transform: scale(0);
    }
  }
`

export default GlobalStyles