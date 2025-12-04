import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Input, Tag, Empty, Spin, Tooltip } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { base } from '../../../../../api/base';

const { Search } = Input;

const PaletteContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
`;

const CategorySection = styled.div`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin-bottom: 12px;
  padding: 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NodeList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 0 16px;
`;

const NodeItem = styled.div`
  padding: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  text-align: center;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const NodeIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 8px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? '#333' : '#f5f5f5'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const NodeName = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin-bottom: 4px;
  font-weight: 500;
`;

const NodeTag = styled(Tag)`
  font-size: 10px;
  padding: 2px 6px;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`;

interface NodeConfig {
  id: number;
  nodeKey: string;
  nodeName: string;
  category: string;
  tag?: string;
  iconUrl?: string;
  description?: string;
  defaultParams?: string;
  isVipOnly?: boolean;
  baseCost?: number;
}

interface NodePaletteProps {
  visible: boolean;
  onClose: () => void;
  onSelectNode: (node: NodeConfig) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ visible, onClose, onSelectNode }) => {
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载节点配置
  const loadNodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base.getNodeConfigList();
      if (response.success && response.data) {
        setNodes(response.data);
      }
    } catch (error) {
      console.error('加载节点配置失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadNodes();
    }
  }, [visible, loadNodes]);

  // 按分类分组节点
  const groupedNodes = nodes.reduce((acc, node) => {
    const category = node.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as Record<string, NodeConfig[]>);

  // 过滤节点
  const filteredGroupedNodes = Object.keys(groupedNodes).reduce((acc, category) => {
    const filtered = groupedNodes[category].filter(node =>
      node.nodeName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      node.nodeKey.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, NodeConfig[]>);

  // 分类显示名称映射
  const categoryNames: Record<string, string> = {
    input: '输入',
    model: '模型',
    upscale: '增强',
    logic: '逻辑',
    other: '其他',
  };

  const handleSelectNode = (node: NodeConfig) => {
    onSelectNode(node);
    onClose();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>节点库</span>
          <CloseOutlined onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
      }
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      closable={false}
      styles={{
        body: { padding: 0 },
      }}
    >
      <PaletteContainer>
        <Header>
          <Search
            placeholder="搜索节点..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="large"
          />
        </Header>
        <Content>
          <Spin spinning={loading}>
            {Object.keys(filteredGroupedNodes).length === 0 ? (
              <Empty
                description={searchKeyword ? '没有找到匹配的节点' : '暂无可用节点'}
                style={{ marginTop: 60 }}
              />
            ) : (
              Object.keys(filteredGroupedNodes).map((category) => (
                <CategorySection key={category}>
                  <CategoryTitle>
                    {categoryNames[category] || category}
                  </CategoryTitle>
                  <NodeList>
                    {filteredGroupedNodes[category].map((node) => (
                      <Tooltip key={node.id} title={node.description || node.nodeName}>
                        <NodeItem onClick={() => handleSelectNode(node)}>
                          <NodeIcon>
                            {node.iconUrl ? (
                              <img src={node.iconUrl} alt={node.nodeName} />
                            ) : (
                              <span>📦</span>
                            )}
                          </NodeIcon>
                          <NodeName>{node.nodeName}</NodeName>
                          {node.tag && (
                            <NodeTag color={node.tag === 'NEW' ? 'blue' : node.tag === 'HOT' ? 'red' : 'orange'}>
                              {node.tag}
                            </NodeTag>
                          )}
                        </NodeItem>
                      </Tooltip>
                    ))}
                  </NodeList>
                </CategorySection>
              ))
            )}
          </Spin>
        </Content>
      </PaletteContainer>
    </Drawer>
  );
};

export default NodePalette;

