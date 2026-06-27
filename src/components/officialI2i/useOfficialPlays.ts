import { useCallback, useEffect, useState } from 'react';
import instance from 'api/axios';
import {
  I2iOfficialPlay,
  I2iOfficialPlaySortBy,
} from 'pages/Workspace/Create/components/ImageToImage/officialPlayTypes';

export function useOfficialPlays(
  sortBy: I2iOfficialPlaySortBy = 'sort',
  enabled = true
) {
  const [plays, setPlays] = useState<I2iOfficialPlay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await instance.get('/productx/sa-ai-models/image/i2i/official-plays', {
        params: { sortBy },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setPlays(response.data.data);
      } else {
        setPlays([]);
      }
    } catch (err) {
      console.error('Failed to load official plays:', err);
      setError('load_failed');
      setPlays([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (enabled) {
      fetchPlays();
    }
  }, [enabled, fetchPlays]);

  return { plays, loading, error, refetch: fetchPlays };
}
