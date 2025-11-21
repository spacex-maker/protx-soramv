import React from 'react';
import { Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';

interface NewFolderModalProps {
  visible: boolean;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onOk: () => void;
  onCancel: () => void;
  loading: boolean;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  visible,
  folderName,
  onFolderNameChange,
  onOk,
  onCancel,
  loading
}) => {
  const intl = useIntl();

  return (
    <Modal
      title={<FormattedMessage id="modal.newFolder.title" defaultMessage="新建文件夹" />}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Input
        placeholder={intl.formatMessage({ id: 'modal.newFolder.placeholder', defaultMessage: '请输入文件夹名称' })}
        value={folderName}
        onChange={(e) => onFolderNameChange(e.target.value)}
        onPressEnter={onOk}
        autoFocus
      />
    </Modal>
  );
};

export default NewFolderModal; 