import { sendGet, sendPut, sendDelete, sendPost } from "./axios";

export const employeeApi = {
    getEmployees: (params: any) => sendGet("/employees", params),
    getEmployeeDetails: (id: string) => sendGet(`/employees/${id}`),
    searchEmployees: (params: any) => sendGet("/employees/search", params),
    filterEmployees: (params: any) => sendGet("/employees/filter", params),
    createEmployee: (data: any) => sendPost("/employees", data),
    updateEmployee: (id: string, data: any) => sendPut(`/employees/${id}`, data),
    deleteEmployee: (id: string) => sendDelete(`/employees/${id}`),
    getEmployeesMetadata: () => sendGet("/employees/metadata"),
    resetPasswordBulk: (data: { employeeIds: string[]; newPassword: string }) =>
        sendPost("/employees/reset-password-bulk", data),
};
