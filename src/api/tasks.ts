import { sendGet, sendPut, sendDelete, sendPost } from "./axios";

export const taskApi = {
    // 4A: Task Assignment
    getTasks: (params: any) => sendGet("/tasks", params),
    getOverdueTasks: () => sendGet("/tasks/overdue"),
    searchTasks: (params: any) => sendGet("/tasks/search", params),
    filterTasks: (params: any) => sendGet("/tasks/filter", params),
    getTaskStatistics: () => sendGet("/tasks/statistics"),
    getTaskDetails: (id: string) => sendGet(`/tasks/${id}`),
    createTask: (data: any) => sendPost("/tasks", data),
    updateTask: (id: string, data: any) => sendPut(`/tasks/${id}`, data),
    deleteTask: (id: string) => sendDelete(`/tasks/${id}`),

    // 4B: Construction Logs
    getLogs: (params: any) => sendGet("/construction-logs", params),
    createLog: (data: any) => sendPost("/construction-logs", data),
    startNewDay: (data: { newDate: string; projectName: string; constructionName: string }) =>
        sendPost("/construction-logs/new-day", data),
    searchLogs: (params: any) => sendGet("/construction-logs/search", params),
    getAutocomplete: () => sendGet("/construction-logs/autocomplete"),
    getLogDetails: (id: string) => sendGet(`/construction-logs/${id}`),
    updateLog: (id: string, data: any) => sendPut(`/construction-logs/${id}`, data),
    deleteLog: (id: string) => sendDelete(`/construction-logs/${id}`),
    endShift: (id: string, data: { endTime: string; shiftSummary: string }) =>
        sendPut(`/construction-logs/${id}/end-shift`, data),
    exportLog: (id: string) => sendGet(`/construction-logs/${id}/export`),
};
