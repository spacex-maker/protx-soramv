import React from 'react';
import { VideoCameraOutlined } from '@ant-design/icons';
import { NodeHeader as StyledNodeHeader, NodeTitle, NodeIcon, NodeName, CostInfo, NodeTag } from '../styles';
import { ImageToVideoNodeData } from '../types';

interface NodeHeaderProps {
  nodeData: ImageToVideoNodeData | null;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({ nodeData }) => {
  const baseCost = nodeData?.nodeConfig?.baseCost || 5;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  return (
    <StyledNodeHeader>
      <NodeTitle>
        <NodeIcon>
          <VideoCameraOutlined />
        </NodeIcon>
        <div>
          <NodeName>图生视频</NodeName>
          <CostInfo>
            {pricingMode === 'FIXED' ? `固定: ${baseCost}/秒` : `基础: ${baseCost}`}
          </CostInfo>
        </div>
      </NodeTitle>
      {nodeData?.nodeConfig?.tag && (
        <NodeTag color="blue">{nodeData.nodeConfig.tag}</NodeTag>
      )}
    </StyledNodeHeader>
  );
};

