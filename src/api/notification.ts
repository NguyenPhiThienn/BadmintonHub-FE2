import { sendGet, sendPut } from "./axios";

export const notificationApi = {
  getNotifications: (params: { page: number; limit: number }) =>
    sendGet('/notifications', params),

  markAsRead: (id: string) =>
    sendPut(`/notifications/${id}/read`),

  markAllAsRead: () =>
    sendPut('/notifications/read-all'),
};
