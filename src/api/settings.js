import instance from './axios';

/**
 * 用户系统设置 API
 */

/**
 * 获取当前用户系统设置
 * @returns {Promise}
 */
export const getUserSettings = () => {
  return instance.get('/productx/user-settings');
};

/**
 * 保存或更新用户系统设置
 * @param {Object} settings - 设置对象
 * @returns {Promise}
 */
export const saveUserSettings = (settings) => {
  return instance.post('/productx/user-settings', settings);
};

/**
 * 重置用户系统设置为默认值
 * @returns {Promise}
 */
export const resetUserSettings = () => {
  return instance.post('/productx/user-settings/reset');
};

/**
 * 更新单个设置项
 * @param {string} category - 设置分类
 * @param {string} key - 设置键
 * @param {any} value - 设置值
 * @returns {Promise}
 */
export const updateSingleSetting = (category, key, value) => {
  return instance.patch(`/productx/user-settings/${category}/${key}`, value);
};
