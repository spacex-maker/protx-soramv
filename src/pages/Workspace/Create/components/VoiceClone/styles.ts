import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Card } from 'antd';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

export const GlobalVoiceCloneStyles = createGlobalStyle`
  .voice-clone-page {
    .ant-segmented {
      border-radius: 12px;
      padding: 4px;
      background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')};
    }

    .ant-segmented-item {
      border-radius: 10px !important;
    }

    .ant-segmented-item-selected {
      box-shadow: 0 2px 8px rgba(114, 46, 209, 0.15);
    }

    .voice-clone-upload.ant-upload-wrapper .ant-upload-drag {
      border-radius: 14px !important;
      border-style: dashed;
      border-color: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.35)' : 'rgba(114, 46, 209, 0.25)')};
      background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.06)' : 'rgba(114, 46, 209, 0.03)')};
      transition: border-color 0.2s, background 0.2s;

      &:hover {
        border-color: #722ed1 !important;
        background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.06)')};
      }

      .ant-upload-drag-icon .anticon {
        color: #722ed1;
      }
    }

    .voice-clone-list-spin {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: visible;
    }

    .voice-clone-list-spin > .ant-spin-container {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: visible;
    }
  }
`;

const recordPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.55; }
`;

export const AudioInputTabs = styled.div`
  margin-bottom: 12px;
`;

export const RecordPanel = styled.div<{ $recording?: boolean }>`
  padding: 18px 16px;
  border-radius: 14px;
  border: 1px dashed
    ${p =>
      p.$recording
        ? 'rgba(255, 77, 79, 0.55)'
        : p.theme.mode === 'dark'
          ? 'rgba(114, 46, 209, 0.35)'
          : 'rgba(114, 46, 209, 0.25)'};
  background: ${p =>
    p.$recording
      ? p.theme.mode === 'dark'
        ? 'rgba(255, 77, 79, 0.08)'
        : 'rgba(255, 77, 79, 0.04)'
      : p.theme.mode === 'dark'
        ? 'rgba(114, 46, 209, 0.06)'
        : 'rgba(114, 46, 209, 0.03)'};
  transition: border-color 0.2s, background 0.2s;
`;

export const RecordTimer = styled.div<{ $recording?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${p => (p.$recording ? '#ff4d4f' : p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
`;

export const RecordWaveDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4d4f;
  animation: ${recordPulse} 1s ease-in-out infinite;
`;

export const RecordPreview = styled.div`
  margin-bottom: 12px;
  padding-top: 4px;
`;

export const RecordActions = styled.div`
  margin-top: 4px;
`;

export const WorkflowSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const WorkflowStep = styled.div<{ $active?: boolean; $done?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid
    ${p =>
      p.$active
        ? 'rgba(114, 46, 209, 0.45)'
        : p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.06)'};
  background: ${p =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(114, 46, 209, 0.12)'
        : 'rgba(114, 46, 209, 0.06)'
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.03)'
        : '#fff'};

  .step-index {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: ${p => (p.$active || p.$done ? '#fff' : p.theme.mode === 'dark' ? '#aaa' : '#888')};
    background: ${p =>
      p.$done ? '#52c41a' : p.$active ? 'linear-gradient(135deg, #722ed1, #9254de)' : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  }

  .step-body {
    min-width: 0;
  }

  .step-title {
    font-size: 13px;
    font-weight: 600;
    color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
    margin-bottom: 2px;
  }

  .step-desc {
    font-size: 12px;
    line-height: 1.45;
    color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
  }
`;

export const ModeSwitchWrap = styled.div`
  margin-bottom: 16px;
`;

export const TrainFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 20px;
    align-items: start;
  }
`;

export const TrainTips = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.6;
  color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
`;

export const SynthSettingsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const SelectedVoiceBar = styled.div<{ $empty?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px dashed
    ${p =>
      p.$empty
        ? p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.12)'
        : 'rgba(114, 46, 209, 0.35)'};
  background: ${p =>
    p.$empty
      ? p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.03)'
        : 'rgba(0,0,0,0.02)'
      : p.theme.mode === 'dark'
        ? 'rgba(114, 46, 209, 0.1)'
        : 'rgba(114, 46, 209, 0.05)'};

  .voice-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ${p => (p.$empty ? '#999' : '#722ed1')};
    background: ${p =>
      p.$empty
        ? p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)'
        : p.theme.mode === 'dark'
          ? 'rgba(114, 46, 209, 0.2)'
          : 'rgba(114, 46, 209, 0.12)'};
  }

  .voice-info {
    flex: 1;
    min-width: 0;
  }

  .voice-name {
    font-size: 14px;
    font-weight: 600;
    color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .voice-hint {
    font-size: 12px;
    color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
    margin-top: 2px;
  }
`;

export const PreviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const UnifiedWorkspaceCard = styled(Card)`
  position: relative;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid ${p => (p.theme.mode === 'dark' ? '#303030' : '#f0f0f0')};
  height: 100%;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #9254de 0%, #722ed1 55%, #531dab 100%);
    z-index: 1;
  }

  .ant-card-head {
    border-bottom: 1px solid ${p => (p.theme.mode === 'dark' ? '#303030' : '#f0f0f0')};
    min-height: 52px;
    padding: 12px 20px;
    background: ${p =>
      p.theme.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(114, 46, 209, 0.08) 0%, transparent 100%)'
        : 'linear-gradient(180deg, rgba(114, 46, 209, 0.04) 0%, transparent 100%)'};
  }

  .ant-card-head-wrapper {
    align-items: center;
    gap: 12px;
  }

  .ant-card-head-title {
    flex: 1;
    min-width: 0;
    padding: 0;
    overflow: visible;
  }

  .ant-card-extra {
    flex-shrink: 0;
    margin-left: 0;
    padding: 0;
  }

  .ant-card-body {
    padding: 18px 20px 20px;
  }
`;

export const WorkspaceBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const WorkspaceEnginePanel = styled.div`
  padding-bottom: 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
`;

export const WorkspaceMainSplit = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
  min-height: 420px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

export const WorkspaceSection = styled.section<{ $tone?: 'voices' | 'synth'; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 16px 18px 18px;
  background: ${p => {
    if (p.$tone === 'synth' && p.$active) {
      return p.theme.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(114, 46, 209, 0.1) 0%, rgba(255,255,255,0.02) 100%)'
        : 'linear-gradient(180deg, rgba(114, 46, 209, 0.05) 0%, #ffffff 100%)';
    }
    return p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa';
  }};

  ${p =>
    p.$tone === 'voices' &&
    `
    border-right: 1px solid ${p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};

    @media (max-width: 900px) {
      border-right: none;
      border-bottom: 1px solid ${p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    }
  `}
`;

export const WorkspaceSectionHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
`;

export const WorkspaceSectionHeadMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

export const WorkspaceStepBadge = styled.span`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #722ed1;
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.2)' : 'rgba(114, 46, 209, 0.1)')};
  border: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.35)' : 'rgba(114, 46, 209, 0.18)')};
`;

export const WorkspaceSectionTitleWrap = styled.div`
  min-width: 0;
`;

export const WorkspaceSectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
`;

export const WorkspaceSectionDesc = styled.p`
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
`;

export const WorkspaceSectionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
`;

export const UnifiedVoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  max-height: min(480px, 52vh);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 4px 8px 2px;
  margin: -2px 0;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')};
  }
`;

export const SynthPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const SynthEmptyPlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 20px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')};
  min-height: 280px;

  .empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #722ed1;
    background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.18)' : 'rgba(114, 46, 209, 0.08)')};
  }

  .empty-title {
    font-size: 14px;
    font-weight: 600;
    color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
  }

  .empty-desc {
    font-size: 12px;
    line-height: 1.55;
    color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
    max-width: 240px;
  }
`;

export const SelectedVoiceChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(220px, 100%);
  padding: 5px 10px 5px 6px;
  border-radius: 999px;
  font-size: 12px;
  color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.16)' : 'rgba(114, 46, 209, 0.08)')};
  border: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.4)' : 'rgba(114, 46, 209, 0.22)')};
  flex-shrink: 0;

  .chip-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #fff;
    background: linear-gradient(135deg, #9254de, #722ed1);
  }

  .chip-name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CloneListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const CloneListTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  color: ${p => (p.theme.mode === 'dark' ? '#f0f0f0' : '#262626')};
`;

export const CloneListCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: #722ed1;
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.18)' : 'rgba(114, 46, 209, 0.08)')};
  border: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.28)' : 'rgba(114, 46, 209, 0.15)')};
`;

export const CloneListToolbar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
`;

export const CloneToolbarIconBtn = styled.button<{ $spinning?: boolean }>`
  appearance: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: ${p => (p.theme.mode === 'dark' ? '#bfbfbf' : '#595959')};
  background: transparent;
  transition: color 0.15s, background 0.15s;

  .anticon {
    font-size: 14px;
    ${p => (p.$spinning ? 'animation: cloneToolbarSpin 0.8s linear infinite;' : '')}
  }

  @keyframes cloneToolbarSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover:not(:disabled) {
    color: #722ed1;
    background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.18)' : 'rgba(114, 46, 209, 0.08)')};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const CloneToolbarPrimaryBtn = styled.button`
  appearance: none;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  background: linear-gradient(135deg, #9254de 0%, #722ed1 100%);
  box-shadow: 0 2px 8px rgba(114, 46, 209, 0.28);
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;

  .anticon {
    font-size: 13px;
  }

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.34);
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const CloneListStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const StatPill = styled.span<{ $variant?: 'ready' | 'training' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: ${p => {
    if (p.$variant === 'ready') return p.theme.mode === 'dark' ? '#95de64' : '#389e0d';
    if (p.$variant === 'training') return p.theme.mode === 'dark' ? '#69c0ff' : '#1677ff';
    return p.theme.mode === 'dark' ? '#aaa' : '#666';
  }};
  background: ${p => {
    if (p.$variant === 'ready') return p.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(82, 196, 26, 0.1)';
    if (p.$variant === 'training') return p.theme.mode === 'dark' ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)';
    return p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  }};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: ${p => (p.$variant === 'training' ? pulse : 'none')} 1.4s ease-in-out infinite;
  }
`;

export const CloneVoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 4px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const UnifiedVoiceGrid = styled(CloneVoiceGrid)`
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: min(480px, 52vh);
  overflow-y: auto;
  padding-right: 4px;
  margin-top: 0;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')};
  }
`;

export const CloneVoiceCard = styled.div<{ $selected?: boolean; $ready?: boolean; $training?: boolean; $listLayout?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: ${p => (p.$listLayout ? '96px' : '132px')};
  padding: 0;
  border-radius: 14px;
  border: 1.5px solid
    ${p =>
      p.$selected
        ? '#722ed1'
        : p.$training
          ? p.theme.mode === 'dark'
            ? 'rgba(22, 119, 255, 0.45)'
            : 'rgba(22, 119, 255, 0.35)'
          : p.theme.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : '#ececec'};
  background: ${p =>
    p.$selected
      ? p.theme.mode === 'dark'
        ? 'linear-gradient(165deg, rgba(114, 46, 209, 0.18) 0%, rgba(20, 20, 20, 0.95) 100%)'
        : 'linear-gradient(165deg, rgba(114, 46, 209, 0.1) 0%, #ffffff 100%)'
      : p.$ready
        ? p.theme.mode === 'dark'
          ? 'linear-gradient(180deg, rgba(114, 46, 209, 0.06) 0%, rgba(255,255,255,0.03) 100%)'
          : 'linear-gradient(180deg, rgba(114, 46, 209, 0.04) 0%, #ffffff 100%)'
        : p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.03)'
          : '#fff'};
  cursor: ${p => (p.$ready ? 'pointer' : 'default')};
  text-align: left;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: ${p =>
    p.$selected
      ? '0 8px 24px rgba(114, 46, 209, 0.16)'
      : p.theme.mode === 'dark'
        ? 'none'
        : '0 2px 10px rgba(15, 23, 42, 0.04)'};

  ${p =>
    p.$selected &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #9254de, #722ed1);
      border-radius: 16px 0 0 16px;
    }
  `}

  ${p =>
    p.$training &&
    `
    animation: cloneTrainingGlow 2.4s ease-in-out infinite;

    @keyframes cloneTrainingGlow {
      0%, 100% { box-shadow: none; }
      50% { box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12); }
    }
  `}

  &:hover {
    border-color: ${p => (p.$ready ? '#9254de' : p.$training ? '#4096ff' : undefined)};
    z-index: 2;
    box-shadow: ${p =>
      p.$ready
        ? '0 10px 28px rgba(114, 46, 209, 0.14)'
        : p.$training
          ? '0 4px 14px rgba(22, 119, 255, 0.12)'
          : p.theme.mode === 'dark'
            ? 'none'
            : '0 4px 14px rgba(15, 23, 42, 0.06)'};
  }

  &:focus-visible {
    outline: 2px solid rgba(114, 46, 209, 0.45);
    outline-offset: 2px;
  }
`;

export const CloneCardAvatar = styled.div<{ $ready?: boolean; $training?: boolean; $failed?: boolean; $selected?: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${p => (p.$selected ? '#fff' : p.$ready ? '#722ed1' : p.$failed ? '#ff4d4f' : p.$training ? '#1677ff' : '#999')};
  background: ${p =>
    p.$selected
      ? 'linear-gradient(135deg, #9254de, #722ed1)'
      : p.$ready
        ? 'linear-gradient(135deg, rgba(114, 46, 209, 0.2), rgba(146, 84, 222, 0.1))'
        : p.$failed
          ? p.theme.mode === 'dark'
            ? 'rgba(255, 77, 79, 0.12)'
            : 'rgba(255, 77, 79, 0.08)'
          : p.$training
            ? p.theme.mode === 'dark'
              ? 'rgba(22, 119, 255, 0.14)'
              : 'rgba(22, 119, 255, 0.08)'
            : p.theme.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)'};
  box-shadow: ${p =>
    p.$selected
      ? '0 4px 12px rgba(114, 46, 209, 0.35)'
      : p.$ready
        ? 'inset 0 0 0 1px rgba(114, 46, 209, 0.2)'
        : p.$training
          ? 'inset 0 0 0 1px rgba(22, 119, 255, 0.25)'
          : 'none'};
`;

export const CloneCardCornerActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const CloneCardIconBtn = styled.button<{ $danger?: boolean; $spinning?: boolean }>`
  appearance: none;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: ${p =>
    p.$danger
      ? '#ff4d4f'
      : p.theme.mode === 'dark'
        ? '#bfbfbf'
        : '#8c8c8c'};
  background: ${p =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  transition: color 0.15s, background 0.15s;

  .anticon {
    font-size: 13px;
    ${p => (p.$spinning ? `animation: spin 0.8s linear infinite;` : '')}
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover {
    color: ${p => (p.$danger ? '#ff7875' : '#722ed1')};
    background: ${p =>
      p.$danger
        ? p.theme.mode === 'dark'
          ? 'rgba(255, 77, 79, 0.15)'
          : 'rgba(255, 77, 79, 0.08)'
        : p.theme.mode === 'dark'
          ? 'rgba(114, 46, 209, 0.18)'
          : 'rgba(114, 46, 209, 0.08)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CloneCardBody = styled.div<{ $hasDemoFooter?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding: 14px 14px ${p => (p.$hasDemoFooter ? '10px' : '12px')};
  padding-right: 62px;
`;

export const CloneCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const CloneCardMain = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 2px;
`;

export const CloneCardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-bottom: 4px;
`;

export const CloneCardName = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  color: ${p => (p.theme.mode === 'dark' ? '#f8fafc' : '#0f172a')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CloneStatusPill = styled.span<{ $variant?: 'ready' | 'training' | 'failed' | 'unknown' | 'expired' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: ${p => {
    switch (p.$variant) {
      case 'ready':
      case 'success':
        return p.theme.mode === 'dark' ? '#95de64' : '#389e0d';
      case 'training':
        return p.theme.mode === 'dark' ? '#69c0ff' : '#1677ff';
      case 'failed':
        return '#ff4d4f';
      case 'expired':
        return p.theme.mode === 'dark' ? '#ffc069' : '#d48806';
      default:
        return p.theme.mode === 'dark' ? '#aaa' : '#666';
    }
  }};
  background: ${p => {
    switch (p.$variant) {
      case 'ready':
      case 'success':
        return p.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.14)' : 'rgba(82, 196, 26, 0.1)';
      case 'training':
        return p.theme.mode === 'dark' ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.08)';
      case 'failed':
        return p.theme.mode === 'dark' ? 'rgba(255, 77, 79, 0.14)' : 'rgba(255, 77, 79, 0.08)';
      case 'expired':
        return p.theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.14)' : '#fff7e6';
      default:
        return p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    }
  }};

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    ${p => (p.$variant === 'training' ? `animation: ${pulse} 1.4s ease-in-out infinite;` : '')}
  }
`;

export const CloneCardMeta = styled.div`
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: ${p => (p.theme.mode === 'dark' ? '#64748b' : '#94a3b8')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.01em;
`;

export const FailReasonText = styled.div`
  font-size: 11px;
  line-height: 1.45;
  padding: 6px 8px;
  border-radius: 8px;
  color: #ff4d4f;
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.06)')};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CloneDemoAudioWrap = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
  padding: 10px 14px 12px;
  border-top: 1px solid ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.2)' : 'rgba(114, 46, 209, 0.12)')};
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.05)')};
  border-radius: 0 0 14px 14px;

  audio {
    display: block;
    width: 100%;
    height: 32px;
  }
`;

export const EmptyLibrary = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  background: ${p => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff')};
  min-height: 220px;

  .ant-empty-description {
    color: ${p => (p.theme.mode === 'dark' ? '#888' : '#999')};
  }
`;
