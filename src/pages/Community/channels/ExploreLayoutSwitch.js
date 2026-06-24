import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { EXPLORE_VIEW_OPTIONS } from './exploreLayoutModes';

const Wrap = styled.div`
  position: fixed;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 190;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  border-radius: 100px;
  background: rgba(12, 12, 14, 0.72);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: calc(100vw - 24px);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    top: 76px;
  }
`;

const Tab = styled(motion.button)`
  position: relative;
  padding: 8px 12px;
  border: none;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  color: ${({ $active }) => ($active ? '#f5f5f7' : 'rgba(255, 255, 255, 0.45)')};
  background: transparent;
  white-space: nowrap;
  transition: color 0.25s ease;

  &:hover {
    color: #f5f5f7;
  }
`;

const ActiveBg = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.12);
  z-index: 0;
`;

const TabLabel = styled.span`
  position: relative;
  z-index: 1;
`;

const ExploreLayoutSwitch = ({ value, onChange }) => (
  <Wrap role="tablist" aria-label="Explore layout">
    {EXPLORE_VIEW_OPTIONS.map((opt) => {
      const active = value === opt.id;
      return (
        <Tab
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={active}
          $active={active}
          onClick={() => onChange(opt.id)}
        >
          {active && (
            <ActiveBg
              layoutId="explore-view-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <TabLabel>
            <FormattedMessage id={opt.labelId} defaultMessage={opt.defaultLabel} />
          </TabLabel>
        </Tab>
      );
    })}
  </Wrap>
);

export default ExploreLayoutSwitch;
