import { sendGet, sendPut } from "./axios";

export const reportApi = {
    // Dashboard / Statistics
    getStatistics: () => sendGet("/reports/statistics"),

    // 6A: Notifications
    getNotifications: (params: any) => sendGet("/notifications", params),
    getUnreadCount: () => sendGet("/notifications/unread-count"),
    getNotificationDetails: (id: string) => sendGet(`/notifications/${id}`),
    markRead: (id: string) => sendPut(`/notifications/${id}/read`),
    markReadAll: () => sendPut("/notifications/read-all"),

    // 6B: Reports
    getEquipmentReport: () => sendGet("/reports/equipment"),
    getTaskReport: () => sendGet("/reports/tasks"),
    getBorrowReturnReport: () => sendGet("/reports/borrow-return"),
    exportReport: (type: string) => sendGet("/reports/export", { type }),
};
