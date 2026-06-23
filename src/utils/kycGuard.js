import { Modal } from 'antd';
import zh_CN from '../locales/zh_CN';
import en_US from '../locales/en_US';
import ja_JP from '../locales/ja_JP';
import ko_KR from '../locales/ko_KR';
import fr_FR from '../locales/fr_FR';
import de_DE from '../locales/de_DE';
import es_ES from '../locales/es_ES';
import it_IT from '../locales/it_IT';
import pt_PT from '../locales/pt_PT';
import ru_RU from '../locales/ru_RU';
import ar_SA from '../locales/ar_SA';

const AUTH_MODAL_LOCALES = {
  zh: zh_CN,
  en: en_US,
  ja: ja_JP,
  ko: ko_KR,
  fr: fr_FR,
  de: de_DE,
  es: es_ES,
  it: it_IT,
  pt: pt_PT,
  ru: ru_RU,
  ar: ar_SA,
};

export const VERIFIED_KYC_STATUSES = [2, 5, 6];

let isShowingKycModal = false;

const getKycModalMessages = () => {
  const locale = (typeof localStorage !== 'undefined' && localStorage.getItem('locale')) || '';
  const key = String(locale).toLowerCase().split('-')[0];
  const t = AUTH_MODAL_LOCALES[key] || en_US;
  return {
    title: t['kyc.modal.title'] || 'Real-name verification required',
    content:
      t['kyc.modal.content'] ||
      'This model requires identity verification. Please complete real-name verification before use.',
    okText: t['kyc.modal.ok'] || 'Go to Verification',
    cancelText: t['kyc.modal.cancel'] || 'Later',
  };
};

export const getUserKycStatus = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return 0;
    const userInfo = JSON.parse(raw);
    return userInfo?.kycStatus ?? 0;
  } catch {
    return 0;
  }
};

export const isUserKycVerified = () => VERIFIED_KYC_STATUSES.includes(getUserKycStatus());

export const modelRequiresKyc = (model) => Boolean(model?.requireKyc);

export const showKycRequiredModal = () => {
  if (isShowingKycModal) return;
  isShowingKycModal = true;

  const msg = getKycModalMessages();
  Modal.confirm({
    type: 'warning',
    title: msg.title,
    content: msg.content,
    okText: msg.okText,
    okType: 'primary',
    cancelText: msg.cancelText,
    centered: true,
    maskClosable: false,
    closable: true,
    width: 420,
    styles: {
      body: { paddingTop: 8 },
      footer: { marginTop: 16 },
    },
    onOk: () => {
      isShowingKycModal = false;
      window.location.href = '/verification';
    },
    onCancel: () => {
      isShowingKycModal = false;
    },
  });
};

export const ensureKycForModels = (...models) => {
  const needsKyc = models.filter(Boolean).some((model) => modelRequiresKyc(model));
  if (!needsKyc) return true;
  if (isUserKycVerified()) return true;
  showKycRequiredModal();
  return false;
};
