import React, { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import { moderatePostShelf } from 'api/community';
import { COMMUNITY_POST_STATUS, isPostDelisted } from 'utils/communityPostStatus';

const ToggleWrap = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DelistedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  pointer-events: none;
`;

const ShelfBtn = styled(Button)`
  && {
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    height: 28px;
    padding: 0 10px;
    line-height: 26px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    border: none;
  }
`;

export interface PostShelfToggleProps {
  postId: number;
  status?: number;
  onStatusChange?: (postId: number, newStatus: number) => void;
  showDelistedBadge?: boolean;
}

const PostShelfToggle: React.FC<PostShelfToggleProps> = ({
  postId,
  status = COMMUNITY_POST_STATUS.PUBLIC,
  onStatusChange,
  showDelistedBadge = true,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const delisted = isPostDelisted(status);

  const handlePublish = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setLoading(true);
    try {
      await moderatePostShelf(postId, true);
      message.success(
        intl.formatMessage({
          id: 'community.post.shelf.publishSuccess',
          defaultMessage: '作品已上架',
        })
      );
      onStatusChange?.(postId, COMMUNITY_POST_STATUS.PUBLIC);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        err?.response?.data?.message
          || intl.formatMessage({
            id: 'community.post.shelf.failed',
            defaultMessage: '操作失败',
          })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setLoading(true);
    try {
      await moderatePostShelf(postId, false);
      message.success(
        intl.formatMessage({
          id: 'community.post.shelf.unpublishSuccess',
          defaultMessage: '作品已下架',
        })
      );
      onStatusChange?.(postId, COMMUNITY_POST_STATUS.DELISTED);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        err?.response?.data?.message
          || intl.formatMessage({
            id: 'community.post.shelf.failed',
            defaultMessage: '操作失败',
          })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToggleWrap onClick={(e) => e.stopPropagation()}>
      {delisted && showDelistedBadge && (
        <DelistedBadge>
          {intl.formatMessage({
            id: 'community.post.shelf.delistedBadge',
            defaultMessage: '已下架',
          })}
        </DelistedBadge>
      )}
      {delisted ? (
        <ShelfBtn
          type="primary"
          size="small"
          icon={<VerticalAlignTopOutlined />}
          loading={loading}
          onClick={handlePublish}
        >
          {intl.formatMessage({
            id: 'community.post.shelf.publish',
            defaultMessage: '上架',
          })}
        </ShelfBtn>
      ) : (
        <Popconfirm
          title={intl.formatMessage({
            id: 'community.post.shelf.unpublishConfirm',
            defaultMessage: '确认下架该作品？下架后普通用户将无法看到此作品',
          })}
          okText={intl.formatMessage({
            id: 'community.post.shelf.unpublish',
            defaultMessage: '下架',
          })}
          cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
          onConfirm={handleUnpublish}
        >
          <ShelfBtn
            size="small"
            danger
            icon={<VerticalAlignBottomOutlined />}
            loading={loading}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {intl.formatMessage({
              id: 'community.post.shelf.unpublish',
              defaultMessage: '下架',
            })}
          </ShelfBtn>
        </Popconfirm>
      )}
    </ToggleWrap>
  );
};

export default PostShelfToggle;
