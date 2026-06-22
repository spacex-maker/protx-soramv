import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Alert, Button, Empty, Tag, Timeline, theme } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { auth } from 'api/auth';
import { MainCard, VerificationLoading, VerificationShell } from './verificationShared';
import { formatDateTime, formatFirstAvailableDateTime } from './verificationDateUtils';

const STATUS_TAG = {
  0: { color: 'default', icon: <ClockCircleOutlined /> },
  1: { color: 'processing', icon: <ClockCircleOutlined /> },
  2: { color: 'success', icon: <CheckCircleOutlined /> },
  3: { color: 'error', icon: <CloseCircleOutlined /> },
};

const VerificationHistory = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  const getStatusText = useCallback(
    (status) => {
      switch (status) {
        case 1:
          return intl.formatMessage({ id: 'verification.status.pending', defaultMessage: '审核中' });
        case 2:
          return intl.formatMessage({ id: 'verification.status.approved', defaultMessage: '已通过' });
        case 3:
          return intl.formatMessage({ id: 'verification.status.rejected', defaultMessage: '未通过' });
        default:
          return intl.formatMessage({ id: 'verification.status.unsubmitted', defaultMessage: '未提交' });
      }
    },
    [intl]
  );

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await auth.getUserKycRecords();
      if (result.success) {
        setRecords(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message || intl.formatMessage({ id: 'verification.history.loadError', defaultMessage: '加载认证记录失败' }));
      }
    } catch (err) {
      console.error('加载认证记录失败:', err);
      setError(intl.formatMessage({ id: 'verification.history.loadError', defaultMessage: '加载认证记录失败' }));
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const timelineItems = useMemo(
    () =>
      records.map((record, index) => {
        const statusMeta = STATUS_TAG[record.status] || STATUS_TAG[0];
        const recordNo = records.length - index;

        return {
          key: record.id || index,
          color: statusMeta.color === 'processing' ? 'blue' : statusMeta.color === 'success' ? 'green' : statusMeta.color === 'error' ? 'red' : 'gray',
          dot: statusMeta.icon,
          children: (
            <div
              style={{
                background: token.colorBgLayout,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: token.colorText, marginBottom: 4 }}>
                    {intl.formatMessage(
                      { id: 'verification.history.recordNo', defaultMessage: '第 {no} 次申请' },
                      { no: recordNo }
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    {intl.formatMessage({ id: 'verification.info.submitTime', defaultMessage: '提交时间：' })}
                    {formatFirstAvailableDateTime(record.submittedAt, record.createTime) || '-'}
                  </div>
                </div>
                <Tag color={statusMeta.color} icon={statusMeta.icon}>
                  {getStatusText(record.status)}
                </Tag>
              </div>

              <div style={{ display: 'grid', gap: 8, fontSize: 14, color: token.colorTextSecondary }}>
                {record.countryCode ? (
                  <div>
                    <strong>{intl.formatMessage({ id: 'verification.info.country', defaultMessage: '国家/地区：' })}</strong>
                    {record.countryCode}
                  </div>
                ) : null}
                {record.realName ? (
                  <div>
                    <strong>{intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' })}</strong>
                    {record.realName}
                  </div>
                ) : null}
                {record.idType ? (
                  <div>
                    <strong>{intl.formatMessage({ id: 'verification.info.idType', defaultMessage: '证件类型：' })}</strong>
                    {record.idType}
                  </div>
                ) : null}
                {record.idNumber ? (
                  <div>
                    <strong>{intl.formatMessage({ id: 'verification.info.idNumber', defaultMessage: '证件号码：' })}</strong>
                    {record.idNumber}
                  </div>
                ) : null}
                {record.verifiedAt ? (
                  <div>
                    <strong>{intl.formatMessage({ id: 'verification.info.verifyTime', defaultMessage: '认证时间：' })}</strong>
                    {formatDateTime(record.verifiedAt)}
                  </div>
                ) : null}
              </div>

              {record.status === 3 && record.rejectReason ? (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginTop: 12, borderRadius: 8, textAlign: 'left' }}
                  message={intl.formatMessage({ id: 'verification.rejected.reason', defaultMessage: '拒绝原因' })}
                  description={record.rejectReason}
                />
              ) : null}
            </div>
          ),
        };
      }),
    [records, intl, token, getStatusText]
  );

  if (loading) {
    return <VerificationLoading />;
  }

  return (
    <VerificationShell>
      <MainCard $token={token}>
        <div style={{ marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ padding: 0, marginBottom: 12, fontSize: 14 }}
          >
            {intl.formatMessage({ id: 'verification.back', defaultMessage: '返回' })}
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HistoryOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: token.colorText, margin: 0, lineHeight: 1.3 }}>
                {intl.formatMessage({ id: 'verification.history.title', defaultMessage: '实名认证记录' })}
              </h1>
              <p style={{ color: token.colorTextSecondary, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {intl.formatMessage({
                  id: 'verification.history.subtitle',
                  defaultMessage: '查看您的历次实名认证申请及审核结果',
                })}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <Alert type="error" showIcon message={error} style={{ marginBottom: 16, borderRadius: 10 }} />
        ) : null}

        {records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({ id: 'verification.history.empty', defaultMessage: '暂无认证记录' })}
          />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </MainCard>
    </VerificationShell>
  );
};

export default VerificationHistory;
