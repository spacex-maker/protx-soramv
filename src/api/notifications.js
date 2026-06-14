import instance from './axios';

/**
 * 用户通知 API
 */

export const getNotifications = (params = {}) => {
  return instance.get('/productx/user-notifications', { params });
};

export const getUnreadNotificationCount = () => {
  return instance.get('/productx/user-notifications/unread-count');
};

export const markNotificationRead = (id) => {
  return instance.post(`/productx/user-notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return instance.post('/productx/user-notifications/read-all');
};

export const deleteNotification = (id) => {
  return instance.delete(`/productx/user-notifications/${id}`);
};
