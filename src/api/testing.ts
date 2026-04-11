import { sendDelete, sendGet, sendPatch, sendPost, sendPut } from "./axios";

export const testingApi = {
    // Device Types
    getDeviceTypes: () => sendGet("/device-types"),
    getDeviceTypeDetails: (id: string) => sendGet(`/device-types/${id}`),
    createDeviceType: (data: any) => sendPost("/device-types", data),
    updateDeviceType: (id: string, data: any) => sendPut(`/device-types/${id}`, data),
    deleteDeviceType: (id: string) => sendDelete(`/device-types/${id}`),
    uploadTemplate: (id: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return sendPost(`/device-types/${id}/template`, formData);
    },

    // Test Categories
    getTestCategoryTree: (deviceTypeId: string) => sendGet(`/test-categories/tree/${deviceTypeId}`),
    createTestCategory: (data: any) => sendPost("/test-categories", data),
    updateTestCategory: (id: string, data: any) => sendPatch(`/test-categories/${id}`, data),
    reorderTestCategories: (ids: string[]) => sendPatch("/test-categories/reorder", { ids }),
    deleteTestCategory: (id: string) => sendDelete(`/test-categories/${id}`),

    // Testing Devices
    getTestingDevices: (params?: any) => sendGet("/testing-devices", params),
    getTestingDeviceDetails: (id: string) => sendGet(`/testing-devices/${id}`),
    createTestingDevice: (data: any) => sendPost("/testing-devices", data),
    updateTestingDevice: (id: string, data: any) => sendPut(`/testing-devices/${id}`, data),
    deleteTestingDevice: (id: string) => sendDelete(`/testing-devices/${id}`),
    getTestingDevicePartners: (params?: any) => sendGet("/testing-devices/partners", params),

    // Test Jobs
    getTestJobs: (params?: any) => sendGet("/test-jobs", params),
    getTestJobDetails: (id: string) => sendGet(`/test-jobs/${id}`),
    createTestJob: (data: any) => sendPost("/test-jobs", data),
    updateTestJob: (id: string, data: any) => sendPut(`/test-jobs/${id}`, data),
    deleteTestJob: (id: string) => sendDelete(`/test-jobs/${id}`),
    getGroupedTestJobs: (params?: any) => sendGet("/test-jobs/grouped", params),
};
