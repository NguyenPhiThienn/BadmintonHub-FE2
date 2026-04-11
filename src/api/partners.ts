import { sendGet, sendPut, sendDelete, sendPost } from "./axios";

export const partnerApi = {
    // 5A: Partner Information
    getPartners: (params: any) => sendGet("/partners", params),
    searchPartners: (params: any) => sendGet("/partners/search", params),
    getPartnerDetails: (id: string) => sendGet(`/partners/${id}`),
    createPartner: (data: any) => sendPost("/partners", data),
    updatePartner: (id: string, data: any) => sendPut(`/partners/${id}`, data),
    deletePartner: (id: string) => sendDelete(`/partners/${id}`),
    createPartnerAccount: (id: string, data: any) => sendPost(`/partners/${id}/account`, data),
    cancelPartnerAccount: (partnerId: string, contactId: string) => sendDelete(`/partners/${partnerId}/account/${contactId}`),

    // 5B: Construction Plans
    getPlans: (params: any) => sendGet("/construction-plans", params),
    getPlansByPartner: (partnerId: string) => sendGet(`/construction-plans/partner/${partnerId}`),
    getPlanDetails: (id: string) => sendGet(`/construction-plans/${id}`),
    createPlan: (data: any) => sendPost("/construction-plans", data),
    updatePlan: (id: string, data: any) => sendPut(`/construction-plans/${id}`, data),
    deletePlan: (id: string) => sendDelete(`/construction-plans/${id}`),
    downloadPlan: (id: string) => sendGet(`/construction-plans/download/${id}`),
};
