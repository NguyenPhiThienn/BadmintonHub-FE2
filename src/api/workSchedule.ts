import { sendGet, sendPut, sendDelete, sendPost } from "./axios";
import {
    IWorkScheduleCreate,
    IWorkScheduleUpdate,
    IWorkScheduleSearchParams,
    IWorkScheduleCalendarParams,
} from "@/interface/workSchedule";

export const workScheduleApi = {
    // Lấy danh sách lịch làm việc
    getWorkSchedules: (params: { page?: number; limit?: number }) =>
        sendGet("/work-schedules", params),

    // Lấy Chi tiết công việc
    getWorkScheduleDetails: (id: string) => sendGet(`/work-schedules/${id}`),

    // Tạo lịch làm việc mới
    createWorkSchedule: (data: IWorkScheduleCreate) =>
        sendPost("/work-schedules", data),

    // Cập nhật lịch làm việc
    updateWorkSchedule: (id: string, data: IWorkScheduleUpdate) =>
        sendPut(`/work-schedules/${id}`, data),

    // Xóa lịch làm việc
    deleteWorkSchedule: (id: string) => sendDelete(`/work-schedules/${id}`),

    // Tìm kiếm lịch làm việc
    searchWorkSchedules: (params: IWorkScheduleSearchParams) =>
        sendGet("/work-schedules/search", params),

    // Lấy lịch làm việc theo nhân viên
    getWorkSchedulesByEmployee: (employeeId: string) =>
        sendGet(`/work-schedules/employee/${employeeId}`),

    // Lấy lịch làm việc dạng calendar
    getWorkScheduleCalendar: (params: IWorkScheduleCalendarParams) =>
        sendGet("/work-schedules/calendar", params),

    // Lấy lịch làm việc cá nhân theo tháng
    getMyWorkScheduleCalendar: (params: { month: number; year: number }) =>
        sendGet("/work-schedules/me", params),
};
