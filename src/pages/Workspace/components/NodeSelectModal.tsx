import React, { useState } from 'react';
import { Modal, Card, Tag, Typography, Tooltip, Button, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { CheckCircleFilled, EditOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { formatFileSize } from 'utils/format';
import { deleteUserStorageNode } from 'services/storageService';
import type { UserStorageNode } from 'services/storageService';
import NodeEditModal from './NodeEditModal';
import NodeCreateModal from './NodeCreateModal';

const { Text } = Typography;

interface NodeSelectModalProps {
  open: boolean;
  onClose: () => void;
  nodes: UserStorageNode[];
  selectedNodeId: number | null;
  onNodeSelect: (nodeId: number) => void;
  onNodeUpdate: (nodeId: number, values: { nodeName: string }) => Promise<boolean>;
  onNodeCreated?: () => void;
  onNodeDeleted?: () => void;
}

const NodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const NodeCard = styled(Card as any)<{ $isSelected: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#fff'};
  border-color: ${props => props.$isSelected 
    ? (props.theme.mode === 'dark' ? '#177ddc' : '#1890ff')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#d9d9d9')};

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#177ddc' : '#1890ff'};
  }

  ${props => props.$isSelected && `
    .ant-card-head {
      background: ${props.theme.mode === 'dark' ? 'rgba(23, 125, 220, 0.1)' : '#e6f7ff'};
      border-bottom-color: ${props.theme.mode === 'dark' ? '#177ddc' : '#1890ff'};
    }

    .ant-card-body {
      background: ${props.theme.mode === 'dark' ? 'rgba(23, 125, 220, 0.04)' : 'transparent'};
    }
  `}

  .storage-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  }

  .storage-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
  position: absolute;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const IconButton = styled.span<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};

  &:hover {
    background: ${props => {
      if (props.$danger) {
        return props.theme.mode === 'dark' ? 'rgba(255, 77, 79, 0.2)' : 'rgba(255, 77, 79, 0.1)';
      }
      return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    }};
  }

  .anticon {
    color: ${props => {
      if (props.$danger) {
        return props.theme.mode === 'dark' ? '#ff4d4f' : '#ff4d4f';
      }
      return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
    }};
    font-size: 16px;
  }
`;

const CardTitle = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 80px;

  &:hover ${ActionButtons} {
    opacity: 1;
  }
`;

const NodeSelectModal: React.FC<NodeSelectModalProps> = ({
  open,
  onClose,
  nodes,
  selectedNodeId,
  onNodeSelect,
  onNodeUpdate,
  onNodeCreated,
  onNodeDeleted,
}) => {
  const intl = useIntl();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentEditNode, setCurrentEditNode] = useState<UserStorageNode | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<number | null>(null);

  const handleEditClick = (e: React.MouseEvent<HTMLElement>, node: UserStorageNode) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentEditNode(node);
    setEditModalVisible(true);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLElement>, node: UserStorageNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    Modal.confirm({
      title: intl.formatMessage({ id: 'cloudDrive.nodeSelect.deleteConfirm.title', defaultMessage: '确认删除节点' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage(
        { id: 'cloudDrive.nodeSelect.deleteConfirm.content', defaultMessage: '确定要删除节点 "{nodeName}" 吗？删除后无法恢复！' },
        { nodeName: node.nodeName }
      ),
      okText: intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' }),
      cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingNodeId(node.id);
        try {
          const response = await deleteUserStorageNode(node.id);
          if (response.success) {
            message.success(intl.formatMessage({ id: 'cloudDrive.nodeSelect.deleteSuccess', defaultMessage: '节点删除成功' }));
            if (onNodeDeleted) {
              onNodeDeleted();
            }
          } else {
            message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeSelect.deleteFailed', defaultMessage: '删除节点失败' }));
          }
        } catch (error) {
          console.error('删除节点失败:', error);
          message.error(intl.formatMessage({ id: 'cloudDrive.nodeSelect.deleteFailed', defaultMessage: '删除节点失败' }));
        } finally {
          setDeletingNodeId(null);
        }
      }
    });
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, nodeId: number) => {
    // 检查是否点击了操作按钮或其子元素
    const target = e.target as HTMLElement;
    if (target.closest('.action-buttons') || target.closest('.anticon-edit') || target.closest('.anticon-delete')) {
      return;
    }
    onNodeSelect(nodeId);
  };

  const renderCardTitle = (node: UserStorageNode) => (
    <CardTitle>
      <Tooltip title={node.nodeRegion}>
        <span>
          {node.nodeName}
          {node.isDefault && (
            <Tag color="gold" style={{ marginLeft: 8 }}>
              <FormattedMessage id="common.default" defaultMessage="默认" />
            </Tag>
          )}
          {node.id === selectedNodeId && (
            <CheckCircleFilled
              style={{
                color: '#52c41a',
                marginLeft: 8,
              }}
            />
          )}
        </span>
      </Tooltip>
      <ActionButtons className="action-buttons">
        <Tooltip title={<FormattedMessage id="common.edit" defaultMessage="编辑" />}>
          <IconButton 
            onClick={(e) => handleEditClick(e, node)}
          >
            <EditOutlined />
          </IconButton>
        </Tooltip>
        {!node.isDefault && (
          <Tooltip title={<FormattedMessage id="common.delete" defaultMessage="删除" />}>
            <IconButton 
              $danger
              onClick={(e) => handleDeleteClick(e, node)}
            >
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        )}
      </ActionButtons>
    </CardTitle>
  );

  const handleNodeCreated = () => {
    setCreateModalVisible(false);
    if (onNodeCreated) {
      onNodeCreated();
    }
  };

  return (
    <>
      <Modal
        title={<FormattedMessage id="cloudDrive.nodeSelect.title" defaultMessage="选择存储节点" />}
        open={open}
        onCancel={onClose}
        footer={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            <FormattedMessage id="cloudDrive.nodeSelect.addNode" defaultMessage="新增存储节点" />
          </Button>
        }
        width={800}
      >
        <NodeGrid>
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              $isSelected={node.id === selectedNodeId}
              size="small"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCardClick(e, node.id)}
              title={renderCardTitle(node)}
            >
              <div className="storage-info">
                <div className="storage-item">
                  <Text type="secondary">
                    <FormattedMessage id="common.nodeType" defaultMessage="节点类型" />
                  </Text>
                  <Tag color={node.nodeType === 'STANDARD' ? 'blue' : 'purple'}>
                    {node.nodeType}
                  </Tag>
                </div>
                
                <div className="storage-item">
                  <Text type="secondary">
                    <FormattedMessage id="common.storageUsed" defaultMessage="已用空间" />
                  </Text>
                  <Text>{formatFileSize(node.storageUsed)}</Text>
                </div>
                
                <div className="storage-item">
                  <Text type="secondary">
                    <FormattedMessage id="common.storageAvailable" defaultMessage="可用空间" />
                  </Text>
                  <Text>{formatFileSize(node.storageAvailable)}</Text>
                </div>
              </div>
            </NodeCard>
          ))}
        </NodeGrid>
      </Modal>

      <NodeEditModal
        open={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentEditNode(null);
        }}
        node={currentEditNode}
        onSave={onNodeUpdate}
      />

      <NodeCreateModal
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleNodeCreated}
      />
    </>
  );
};

export default NodeSelectModal;
