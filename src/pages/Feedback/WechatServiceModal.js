import React from "react";
import { Modal, Button } from "antd";
import { WechatOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { QRCodeSVG } from "qrcode.react";

const WECHAT_ADD_FRIEND_URL = "https://u.wechat.com/MPbFTise1rKSe82vWy-kGbQ";

const WechatServiceModal = ({ open, onClose }) => {
  const intl = useIntl();

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WechatOutlined style={{ color: "#07c160", fontSize: 20 }} />
          {intl.formatMessage({
            id: "feedback.wechatModal.title",
            defaultMessage: "添加微信客服",
          })}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {intl.formatMessage({
            id: "feedback.wechatModal.close",
            defaultMessage: "关闭",
          })}
        </Button>,
        <Button
          key="open"
          type="primary"
          icon={<WechatOutlined />}
          onClick={() => {
            window.open(WECHAT_ADD_FRIEND_URL, "_blank", "noopener,noreferrer");
          }}
          style={{ borderRadius: 10 }}
        >
          {intl.formatMessage({
            id: "feedback.wechatModal.openLink",
            defaultMessage: "打开链接添加微信",
          })}
        </Button>,
      ]}
      centered
      width={320}
      destroyOnClose
    >
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <div
          style={{
            padding: 12,
            background: "#fff",
            borderRadius: 12,
            display: "inline-block",
          }}
        >
          <QRCodeSVG
            value={WECHAT_ADD_FRIEND_URL}
            size={220}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    </Modal>
  );
};

export default WechatServiceModal;
