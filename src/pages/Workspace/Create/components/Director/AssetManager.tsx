import React, { useState } from 'react';
import { Segmented, Space } from 'antd';
import { BankOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { DirectorBuilding, DirectorCharacter, DirectorProp } from 'api/director';
import BuildingManager from './BuildingManager';
import CharacterManager from './CharacterManager';
import PropManager from './PropManager';

const AssetSubTabBar = styled.div`
  margin-bottom: 16px;
`;

export type AssetSubTab = 'characters' | 'props' | 'buildings';

export interface AssetManagerProps {
  projectId: number;
  characters: DirectorCharacter[];
  props: DirectorProp[];
  buildings: DirectorBuilding[];
  characterPropMap: Record<number, number[]>;
  propCharacterMap: Record<number, number[]>;
  onCharactersChange?: () => void;
  onPropsChange?: () => void;
  onBuildingsChange?: () => void;
  onBindingsChange?: () => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({
  projectId,
  characters,
  props,
  buildings,
  characterPropMap,
  propCharacterMap,
  onCharactersChange,
  onPropsChange,
  onBuildingsChange,
  onBindingsChange,
}) => {
  const intl = useIntl();
  const [subTab, setSubTab] = useState<AssetSubTab>('characters');

  return (
    <>
      <AssetSubTabBar>
        <Segmented
          value={subTab}
          onChange={(value) => setSubTab(value as AssetSubTab)}
          options={[
            {
              value: 'characters',
              label: (
                <Space size={6}>
                  <TeamOutlined />
                  <span>
                    {intl.formatMessage({ id: 'director.assets.subTab.characters', defaultMessage: '角色' })}
                  </span>
                </Space>
              ),
            },
            {
              value: 'props',
              label: (
                <Space size={6}>
                  <ToolOutlined />
                  <span>
                    {intl.formatMessage({ id: 'director.assets.subTab.props', defaultMessage: '道具' })}
                  </span>
                </Space>
              ),
            },
            {
              value: 'buildings',
              label: (
                <Space size={6}>
                  <BankOutlined />
                  <span>
                    {intl.formatMessage({ id: 'director.assets.subTab.buildings', defaultMessage: '建筑' })}
                  </span>
                </Space>
              ),
            },
          ]}
        />
      </AssetSubTabBar>

      <div style={{ display: subTab === 'characters' ? 'block' : 'none' }}>
        <CharacterManager
          projectId={projectId}
          characters={characters}
          props={props}
          characterPropMap={characterPropMap}
          onCharactersChange={onCharactersChange}
          onBindingsChange={onBindingsChange}
        />
      </div>

      <div style={{ display: subTab === 'props' ? 'block' : 'none' }}>
        <PropManager
          projectId={projectId}
          props={props}
          characters={characters}
          propCharacterMap={propCharacterMap}
          onPropsChange={onPropsChange}
          onBindingsChange={onBindingsChange}
        />
      </div>

      <div style={{ display: subTab === 'buildings' ? 'block' : 'none' }}>
        <BuildingManager
          projectId={projectId}
          buildings={buildings}
          onBuildingsChange={onBuildingsChange}
        />
      </div>
    </>
  );
};

export default AssetManager;
