import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Button, Result, Spin, Card, message } from "antd";
import { CheckCircleFilled, ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import SimpleHeader from "components/headers/simple";
import { payment } from "api/payment";
import { theme } from "antd";

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.$token?.colorBgLayout};
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled(motion.div)`
  max-width: 600px;
  width: 95%;
  margin: 40px auto;
`;

const OrderCard = styled(Card)`
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const RechargeSuccessPage = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);

  // 从 URL 参数获取订单号（Creem 可能会在 URL 中传递参数）
  const orderNo = searchParams.get('orderNo') || searchParams.get('request_id') || searchParams.get('order_no');

  useEffect(() => {
    if (orderNo) {
      fetchOrderInfo(orderNo);
    } else {
      // 如果没有订单号，显示成功提示但不查询订单详情
      setLoading(false);
      message.info('支付成功！如果余额未到账，请稍候片刻或联系客服');
    }
  }, [orderNo]);

  const fetchOrderInfo = async (orderNo) => {
    setLoading(true);
    try {
      const result = await payment.getOrderDetail(orderNo);
      if (result.success && result.data) {
        setOrderInfo(result.data);
      } else {
        setError(result.message || '获取订单信息失败');
      }
    } catch (error) {
      console.error('获取订单信息失败:', error);
      setError('获取订单信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRecharge = () => {
    navigate('/recharge');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer>
          <Spin size="large" tip="正在查询订单信息..." />
        </ContentContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Result
          status="success"
          icon={<CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 72 }} />}
          title="支付成功！"
          subTitle={
            error 
              ? error 
              : orderInfo 
                ? `订单号：${orderInfo.orderNo}，金额：${orderInfo.amount} ${orderInfo.coinType}`
                : "您的充值请求已提交，请稍候查看余额"
          }
          extra={[
            <Button 
              type="primary" 
              key="back" 
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToRecharge}
              size="large"
            >
              返回充值
            </Button>,
            <Button 
              key="orders" 
              onClick={handleViewOrders}
              size="large"
            >
              查看订单
            </Button>,
            orderNo && (
              <Button 
                key="refresh" 
                icon={<ReloadOutlined />}
                onClick={() => fetchOrderInfo(orderNo)}
                size="large"
              >
                刷新状态
              </Button>
            )
          ].filter(Boolean)}
        />

        {orderInfo && (
          <OrderCard>
            <div style={{ marginBottom: 16 }}>
              <strong>订单详情：</strong>
            </div>
            <div style={{ lineHeight: 2, color: token.colorTextSecondary }}>
              <div>订单号：{orderInfo.orderNo}</div>
              <div>充值金额：{orderInfo.amount} {orderInfo.coinType}</div>
              <div>支付方式：{orderInfo.paymentMethod}</div>
              <div>订单状态：{orderInfo.status}</div>
              {orderInfo.createTime && (
                <div>创建时间：{new Date(orderInfo.createTime).toLocaleString('zh-CN')}</div>
              )}
              {orderInfo.completeTime && (
                <div>完成时间：{new Date(orderInfo.completeTime).toLocaleString('zh-CN')}</div>
              )}
            </div>
          </OrderCard>
        )}

        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: token.colorInfoBg, 
          borderRadius: 8,
          color: token.colorTextSecondary,
          fontSize: 12,
          lineHeight: 1.6
        }}>
          <div style={{ marginBottom: 8, fontWeight: 600, color: token.colorText }}>
            温馨提示：
          </div>
          <div>• 充值成功后，余额通常会在几秒内到账</div>
          <div>• 如果余额未及时到账，请稍候片刻或联系客服</div>
          <div>• 您可以在"订单"页面查看所有充值记录</div>
        </div>
      </ContentContainer>
    </PageLayout>
  );
};

export default RechargeSuccessPage;

