import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { GithubOutlined, MailOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';

const Wrap = styled.footer`
  padding: 48px 24px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  background: #0a0e17;
`;

const NavRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  .sep {
    color: rgba(255, 255, 255, 0.15);
    user-select: none;
  }
`;

const NavLink = styled(Link)`
  color: #9aa0a6;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
  &:hover {
    color: #00d4aa;
  }
`;

const ExtLink = styled.a`
  color: #9aa0a6;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
  &:hover {
    color: #00d4aa;
  }
`;

const Copy = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const FooterSection = () => {
  return (
    <Wrap>
      <NavRow>
        <NavLink to="/openrobotx">
          <HomeOutlined /> 首页
        </NavLink>
        <span className="sep">|</span>
        <NavLink to="/openrobotx/news">
          <FileTextOutlined /> 行业资讯
        </NavLink>
        <span className="sep">|</span>
        <NavLink to="/openrobotx/agi-path">
          通往 AGI 之路
        </NavLink>
        <span className="sep">|</span>
        <ExtLink href="https://github.com/spacex-maker" target="_blank" rel="noopener noreferrer">
          <GithubOutlined /> GitHub
        </ExtLink>
        <span className="sep">|</span>
        <ExtLink href="mailto:aimatex2024@gmail.com">
          <MailOutlined /> 联系
        </ExtLink>
      </NavRow>
      <Copy>Open Robot X · 开源具身智能社区 · 2026</Copy>
    </Wrap>
  );
};

export default FooterSection;
