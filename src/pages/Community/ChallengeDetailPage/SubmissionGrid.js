import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Spin, Empty } from 'antd';
import { FormattedMessage } from 'react-intl';
import { HeartFilled } from '@ant-design/icons';
import { MasonryGrid, ArtCard } from './styled';
import { addTencentImageCompression } from './utils';
import { buildPostDetailPath } from 'utils/communityPostRoutes';

const SubmissionGrid = ({ posts, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  }

  if (posts.length === 0) {
    return <Empty description={<FormattedMessage id="challenge.noEntries" defaultMessage="No entries yet. Be the first!" />} />;
  }

  return (
    <MasonryGrid>
      {posts.map(post => {
        const imageUrl = post.coverUrl || (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? post.mediaUrls[0] : '');
        const likeCount = post.likeCount || 0;
        
        return (
          <ArtCard key={post.id} onClick={() => navigate(buildPostDetailPath(post))}>
            {imageUrl && <img src={addTencentImageCompression(imageUrl, { quality: 20 })} loading="lazy" alt={post.title || ''} />}
            <div className="stats">
              <HeartFilled /> {likeCount}
            </div>
            <div className="overlay">
              <div className="user-info">
                <Avatar src={post.userAvatar} size={24} />
                <span>{post.userNickname || ''}</span>
              </div>
            </div>
          </ArtCard>
        );
      })}
    </MasonryGrid>
  );
};

export default SubmissionGrid;

