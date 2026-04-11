import { sendGet, sendPost, sendPut } from "./axios";

export const attendanceApi = {
    // API 1: Chấm công - Lưu & Khóa
    checkIn: (data: { date: string; items: { employeeId: string; type: string; notes?: string }[] }) =>
        sendPost("/attendance/check-in", data),

    // API 1b: Nhân viên tự chấm công
    selfCheckIn: (data: { type: string; notes?: string; date?: string; businessTripNotes?: string }) =>
        sendPost("/attendance/self-check-in", data),

    // API 2: Lấy danh sách chấm công
    getAttendance: (params: any) => sendGet("/attendance", params),

    // API 3: Lấy chấm công 1 nhân viên trong 1 tháng
    getEmployeeMonthly: (employeeId: string, params: { month: number; year: number }) =>
        sendGet(`/attendance/employee/${employeeId}/monthly`, params),

    // API 4: Lấy bảng tổng hợp chấm công tháng (tất cả nhân viên)
    getMonthlySummary: (params: { month: number; year: number; department?: string; search?: string; employeeId?: string }) =>
        sendGet("/attendance/monthly-summary", params),

    // API 5: Ký số bảng chấm công tháng
    signMonthly: (data: { month: number; year: number }) =>
        sendPut("/attendance/sign", data),

    // API 6: Lấy thông tin công dư của nhân viên
    getSurplus: (employeeId: string, params: { month: number; year: number }) =>
        sendGet(`/attendance/surplus/${employeeId}`, params),
    // API 6: Lấy trạng thái chấm công cá nhân hôm nay
    getMyStatus: () => sendGet("/attendance/my-status"),
};
