import { FC } from 'react';

export interface ChallengeDetailPageProps {
  challengeId?: number | string;
  embedInWorkspace?: boolean;
}

declare const ChallengeDetailPage: FC<ChallengeDetailPageProps>;

export default ChallengeDetailPage;
