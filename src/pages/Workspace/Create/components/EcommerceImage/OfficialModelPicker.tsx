import React, { useEffect, useMemo, useState } from 'react';
import { Spin, message } from 'antd';
import styled from 'styled-components';
import instance from 'api/axios';

export type OfficialEcommerceModel = {
  modelCode: string;
  modelName: string;
  modelNameEn?: string | null;
  gender?: string | null;
  bodyType?: string | null;
  poseKey?: string | null;
  composedImageUrl: string;
  description?: string | null;
  sortOrder?: number | null;
};

type Props = {
  value?: string | null;
  onChange: (model: OfficialEcommerceModel | null) => void;
  accent?: string;
  isDark?: boolean;
  genderFilter?: string | null;
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active?: boolean; $accent?: string; $dark?: boolean }>`
  border: 1px solid
    ${(p) => (p.$active ? p.$accent || '#c45c26' : p.$dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  background: ${(p) =>
    p.$active ? `${p.$accent || '#c45c26'}22` : p.$dark ? 'rgba(255,255,255,0.04)' : '#fff'};
  color: ${(p) => (p.$active ? p.$accent || '#c45c26' : p.$dark ? 'rgba(255,255,255,0.75)' : '#444')};
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 10px;
`;

const Card = styled.button<{ $active?: boolean; $accent?: string; $dark?: boolean }>`
  position: relative;
  border: 2px solid
    ${(p) => (p.$active ? p.$accent || '#c45c26' : p.$dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  background: ${(p) => (p.$dark ? '#1c1917' : '#f5f5f4')};
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${(p) => p.$accent || '#c45c26'};
  }

  img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    display: block;
  }
`;

const Meta = styled.div<{ $dark?: boolean }>`
  padding: 6px 8px 8px;
  font-size: 11px;
  line-height: 1.35;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.8)' : '#292524')};
`;

const Pose = styled.div<{ $dark?: boolean }>`
  font-size: 10px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
`;

const Empty = styled.div<{ $dark?: boolean }>`
  font-size: 12px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  padding: 12px 0;
`;

const POSE_LABEL: Record<string, string> = {
  standing: '站立',
  walking: '行走',
  sit: '坐姿',
  three_quarter: '三分身',
};

const GENDER_LABEL: Record<string, string> = {
  female: '女模',
  male: '男模',
  unisex: '中性',
};

export async function fetchOfficialEcommerceModels(): Promise<OfficialEcommerceModel[]> {
  const res = await instance.get('/productx/sa-ai-models/ecommerce/official-models');
  if (res.data?.success && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  return [];
}

const OfficialModelPicker: React.FC<Props> = ({
  value,
  onChange,
  accent = '#c45c26',
  isDark,
  genderFilter,
}) => {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<OfficialEcommerceModel[]>([]);
  const [gender, setGender] = useState<string>(genderFilter || 'all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchOfficialEcommerceModels();
        if (!cancelled) {
          setModels(list);
          if (!value && list[0]) {
            onChange(list[0]);
          }
        }
      } catch {
        if (!cancelled) message.error('加载官方模特失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (gender === 'all') return models;
    return models.filter((m) => (m.gender || '').toLowerCase() === gender);
  }, [models, gender]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (!models.length) {
    return <Empty $dark={isDark}>暂无启用的官方模特，请联系管理员在后台「电商板块 · 官方模特管理」配置。</Empty>;
  }

  return (
    <Wrap>
      <FilterRow>
        <Chip type="button" $dark={isDark} $accent={accent} $active={gender === 'all'} onClick={() => setGender('all')}>
          全部
        </Chip>
        {['female', 'male'].map((g) => (
          <Chip
            key={g}
            type="button"
            $dark={isDark}
            $accent={accent}
            $active={gender === g}
            onClick={() => setGender(g)}
          >
            {GENDER_LABEL[g] || g}
          </Chip>
        ))}
      </FilterRow>
      <Grid>
        {filtered.map((m) => {
          const active = value === m.modelCode;
          return (
            <Card
              key={m.modelCode}
              type="button"
              $active={active}
              $accent={accent}
              $dark={isDark}
              onClick={() => onChange(m)}
            >
              <img src={m.composedImageUrl} alt={m.modelName} />
              <Meta $dark={isDark}>
                <div>{m.modelName}</div>
                <Pose $dark={isDark}>
                  {GENDER_LABEL[m.gender || ''] || m.gender || ''}
                  {m.poseKey ? ` · ${POSE_LABEL[m.poseKey] || m.poseKey}` : ''}
                </Pose>
              </Meta>
            </Card>
          );
        })}
      </Grid>
      {!filtered.length && <Empty $dark={isDark}>该筛选下暂无模特</Empty>}
    </Wrap>
  );
};

export default OfficialModelPicker;
