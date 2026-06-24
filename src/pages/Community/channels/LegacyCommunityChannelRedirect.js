import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  COMMUNITY_CHANNELS_PATH,
  COMMUNITY_PLAZA_PATH,
  communityChannelPath,
  isCommunityChannelKey,
} from 'utils/communityRoutes';

/** 兼容旧链接 /community/:channelKey → /community/c/:channelKey */
const LegacyCommunityChannelRedirect = () => {
  const { channelKey } = useParams();

  if (channelKey === 'explore') {
    return <Navigate to={COMMUNITY_CHANNELS_PATH} replace />;
  }

  if (isCommunityChannelKey(channelKey)) {
    return <Navigate to={communityChannelPath(channelKey)} replace />;
  }

  return <Navigate to={COMMUNITY_PLAZA_PATH} replace />;
};

export default LegacyCommunityChannelRedirect;
