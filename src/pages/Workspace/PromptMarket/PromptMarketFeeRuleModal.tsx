import React from 'react';
import { Modal, Button, theme } from 'antd';

export interface PromptMarketFeeRuleModalProps {
  open: boolean;
  onClose: () => void;
}

const PromptMarketFeeRuleModal: React.FC<PromptMarketFeeRuleModalProps> = ({ open, onClose }) => {
  const { token } = theme.useToken();

  return (
    <Modal
      title="提示词贡献分佣规则"
      open={open}
      onCancel={onClose}
      footer={[<Button key="ok" type="primary" onClick={onClose}>知道了</Button>]}
      width={520}
      destroyOnClose
    >
      <div style={{ lineHeight: 1.8, color: token.colorText }}>
        <p style={{ marginBottom: 12 }}><strong>费用说明</strong></p>
        <p style={{ marginBottom: 12 }}>您设置的费用为其他用户购买该提示词作品时需支付的积分数量。您可获得以下分成比例，<strong>贡献越多，分成越高</strong>。</p>
        <p style={{ marginBottom: 8 }}><strong>用户分成阶梯</strong>（按累计上架并通过审核的作品数）</p>
        <div style={{ marginBottom: 12, border: `1px solid ${token.colorBorder}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', padding: '10px 12px', background: token.colorFillQuaternary, fontWeight: 600, fontSize: 13 }}>
            <span style={{ flex: '1 1 0' }}>档位</span>
            <span style={{ flex: '1.2 1 0' }}>累计作品数</span>
            <span style={{ flex: '0.8 1 0', textAlign: 'right' }}>用户分成</span>
          </div>
          <div style={{ display: 'flex', padding: '8px 12px', borderTop: `1px solid ${token.colorBorder}` }}><span style={{ flex: '1 1 0' }}>新手上路</span><span style={{ flex: '1.2 1 0' }}>1～5 件</span><span style={{ flex: '0.8 1 0', textAlign: 'right', color: token.colorPrimary }}>88%</span></div>
          <div style={{ display: 'flex', padding: '8px 12px', borderTop: `1px solid ${token.colorBorder}` }}><span style={{ flex: '1 1 0' }}>成长达人</span><span style={{ flex: '1.2 1 0' }}>6～20 件</span><span style={{ flex: '0.8 1 0', textAlign: 'right', color: token.colorPrimary }}>92%</span></div>
          <div style={{ display: 'flex', padding: '8px 12px', borderTop: `1px solid ${token.colorBorder}` }}><span style={{ flex: '1 1 0' }}>优质创作者</span><span style={{ flex: '1.2 1 0' }}>21～50 件</span><span style={{ flex: '0.8 1 0', textAlign: 'right', color: token.colorPrimary }}>95%</span></div>
          <div style={{ display: 'flex', padding: '8px 12px', borderTop: `1px solid ${token.colorBorder}` }}><span style={{ flex: '1 1 0' }}>金牌贡献者</span><span style={{ flex: '1.2 1 0' }}>51 件及以上</span><span style={{ flex: '0.8 1 0', textAlign: 'right', color: token.colorSuccess, fontWeight: 600 }}>97%</span></div>
        </div>
        <ul style={{ marginBottom: 12, paddingLeft: 20 }}>
          <li>作品审核通过后，其他用户购买即可为您带来积分收益。</li>
          <li>积分可用于平台内消费或按规则提现（如有开通）。</li>
        </ul>
        <p style={{ marginBottom: 8 }}><strong>建议</strong></p>
        <p style={{ marginBottom: 12 }}>根据作品质量、稀缺度与市场需求合理定价，多分享优质作品还可享受更高分成。</p>
        <p style={{ marginBottom: 8 }}><strong>更多玩法</strong></p>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li><strong>新人福利</strong>：首件作品上架成功，首单 100% 归您。</li>
          <li><strong>成就徽章</strong>：首次成交、累计销量达标等解锁徽章，提升曝光与信任。</li>
          <li><strong>限时活动</strong>：大促期间分成上浮、双倍积分等，以活动公告为准。</li>
          <li><strong>邀请有礼</strong>：邀请好友成为创作者，双方可获得分成优惠或积分奖励。</li>
          <li><strong>榜单曝光</strong>：周榜/月榜「热门创作者」可获得首页或专题推荐位。</li>
          <li><strong>高等级权益</strong>：金牌贡献者等可享专属标识、优先审核、专属客服等。</li>
        </ul>
      </div>
    </Modal>
  );
};

export default PromptMarketFeeRuleModal;
