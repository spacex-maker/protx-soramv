import { Card } from 'antd';
import styled from 'styled-components';

export const AssetLibraryCard = styled(Card)`
  border-radius: 12px;

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .dark & .ant-card-head {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
`;

export const AssetCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fff')};
  box-shadow: ${(p) =>
    p.theme.mode === 'dark' ? '0 4px 16px rgba(0, 0, 0, 0.18)' : '0 4px 16px rgba(15, 23, 42, 0.04)'};
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.28)')};
    box-shadow: ${(p) =>
      p.theme.mode === 'dark' ? '0 14px 32px rgba(0, 0, 0, 0.32)' : '0 14px 32px rgba(15, 23, 42, 0.1)'};
  }

  &:hover .asset-cover img {
    transform: scale(1.04);
  }
`;

export const AssetCover = styled.div<{ $variant?: 'portrait' | 'square' }>`
  position: relative;
  margin: 12px 12px 0;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: ${(p) => (p.$variant === 'square' ? '1 / 1' : '3 / 4')};
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.22) 0%, rgba(114, 46, 209, 0.18) 100%)'
      : 'linear-gradient(145deg, #eff6ff 0%, #f5f3ff 100%)'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;
  }
`;

export const AssetCoverPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(59, 130, 246, 0.55)')};

  .anticon {
    font-size: 40px;
  }
`;

export const AssetSortBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
`;

export const AssetCategoryBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(59, 130, 246, 0.72);
  backdrop-filter: blur(6px);
`;

export const AssetBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 14px 14px 10px;
`;

export const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.92)' : '#1f2937')};
  margin-bottom: 6px;
`;

export const AssetDescription = styled.div`
  font-size: 13px;
  line-height: 1.55;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.55)')};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
`;

export const AssetPromptTag = styled.div`
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.45;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.06)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(59, 130, 246, 0.1)')};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const AssetRelationTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

export const AssetRelationTag = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.4;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : '#475569')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AssetFooter = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;

  .ant-btn {
    flex: 1;
    border-radius: 10px;
    height: 34px;
  }
`;

export const BindAssetRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#eef2f7')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafbfd')};
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.35)')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)')};
  }
`;

export const BindAssetThumb = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dark & {
    background: rgba(255, 255, 255, 0.06);
  }
`;
