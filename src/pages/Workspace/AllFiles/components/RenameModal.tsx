import React, { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { FileModel } from 'models/file/FileModel';
import { useFileContext } from 'contexts/FileContext';

interface RenameModalProps {
  file: FileModel;
  isOpen: boolean;
  onClose: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  file,
  isOpen,
  onClose
}) => {
  const intl = useIntl();
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const { renameFile } = useFileContext();

  useEffect(() => {
    if (isOpen && file) setNewName(file.name);
  }, [isOpen, file]);

  const handleRename = async () => {
    if (newName.trim() === '' || newName === file.name) {
      onClose();
      return;
    }
    
    setLoading(true);
    try {
      const success = await renameFile(file.id, newName);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<FormattedMessage id="filelist.modal.rename.title" defaultMessage="重命名" />}
      open={isOpen}
      onOk={handleRename}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      okText={intl.formatMessage({ id: 'filelist.modal.rename.ok', defaultMessage: '确定' })}
      cancelText={intl.formatMessage({ id: 'filelist.modal.rename.cancel', defaultMessage: '取消' })}
    >
      <Input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onPressEnter={handleRename}
        autoFocus
        maxLength={255}
        placeholder={intl.formatMessage({ id: 'filelist.modal.rename.placeholder' })}
      />
    </Modal>
  );
};

export default RenameModal; 