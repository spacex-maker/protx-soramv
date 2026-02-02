import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { GlobalOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const Wrap = styled.footer`
  padding: 60px 24px 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
`;

const BtnGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
`;

const StyledBtn = styled(Button)`
  height: 48px;
  padding: 0 28px;
  border-radius: 100px;
  font-weight: 600;
`;

const Copy = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const CompanyFooterSection = ({ data }) => {
  const navigate = useNavigate();
  const officialUrl = data.officialUrl || '#';

  return (
    <Wrap>
      <BtnGroup>
        <StyledBtn
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/openrobotx')}
        >
          返回 Open Robot X
        </StyledBtn>
        {officialUrl !== '#' && (
          <StyledBtn
            icon={<GlobalOutlined />}
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e8eaed' }}
          >
            访问官网
          </StyledBtn>
        )}
      </BtnGroup>
      <Copy>Open Robot X 整理 · 非官方介绍 · {data.name}</Copy>
    </Wrap>
  );
};

export default CompanyFooterSection;
