import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import CompanyPageLayout from './CompanyPageLayout';
import { getCompanyBySlug } from '../../../api/openrobotx';
import { apiCompanyToDetail } from './companyAdapter';

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: #0a0e17;
`;

const CompanyPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getCompanyBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const { data: layoutData, theme: layoutTheme } = apiCompanyToDetail(res.data);
          setData(layoutData);
          setTheme(layoutTheme);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <SpinWrap>
        <Spin size="large" />
      </SpinWrap>
    );
  }

  if (notFound || !data) {
    return <Navigate to="/openrobotx" replace />;
  }

  return <CompanyPageLayout data={data} theme={theme} />;
};

export default CompanyPage;
