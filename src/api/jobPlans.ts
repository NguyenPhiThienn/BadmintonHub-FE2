import { ICreateJobPlanRequest, ICreateJobPlanVersionRequest, IGetJobPlanParams, IUpdateJobPlanRequest, IUpdateJobPlanVersionRequest } from "@/interface/jobPlan";
import { sendDelete, sendGet, sendPost, sendPut } from "./axios";

export const jobPlansApi = {
    getJobPlans: (params?: IGetJobPlanParams) => sendGet("/job-plans", params),
    getJobPlanDetails: (id: string) => sendGet(`/job-plans/${id}`),
    createJobPlan: (data: ICreateJobPlanRequest) => sendPost("/job-plans", data),
    updateJobPlan: (id: string, data: IUpdateJobPlanRequest) => sendPut(`/job-plans/${id}`, data),
    deleteJobPlan: (id: string) => sendDelete(`/job-plans/${id}`),
    getVersionList: (id: string) => sendGet(`/job-plans/${id}/versions`),
    createVersion: (id: string, data: ICreateJobPlanVersionRequest) => sendPost(`/job-plans/${id}/versions`, data),
    updateVersion: (id: string, data: IUpdateJobPlanVersionRequest) => sendPut(`/job-plans/${id}/versions`, data),
    deleteVersion: (planId: string, versionId: string) => sendDelete(`/job-plans/${planId}/versions/${versionId}`),

    // Chat / Messaging
    getMessages: (id: string) => sendGet(`/job-plans/${id}/messages`),
    sendMessage: (id: string, data: any) => sendPost(`/job-plans/${id}/messages`, data),
    recallMessage: (id: string, messageId: string) => sendDelete(`/job-plans/${id}/messages/${messageId}/recall`),
    deleteMessageForMe: (id: string, messageId: string) => sendDelete(`/job-plans/${id}/messages/${messageId}/me`),
};
