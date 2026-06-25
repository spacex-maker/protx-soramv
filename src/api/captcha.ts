import axios from './axios';

export interface CaptchaData {
  captchaId: string;
  imageBase64: string;
}

export async function fetchCaptcha() {
  const { data } = await axios.get('/base/system/captcha');
  return data as {
    success: boolean;
    message?: string;
    data?: CaptchaData;
  };
}
