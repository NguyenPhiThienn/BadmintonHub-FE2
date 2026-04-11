import { sendDelete, sendGet, sendPost, sendPut } from "./axios";

export const paymentRecordsApi = {
    // List & Detail
    getPaymentRecords: (params: any) => sendGet("/payment-records", params),
    getPaymentRecordDetails: (id: string) => sendGet(`/payment-records/${id}`),

    // CRUD
    createPaymentRecord: (data: any) => sendPost("/payment-records", data),
    updatePaymentRecord: (id: string, data: any) => sendPut(`/payment-records/${id}`, data),

    // Sign endpoints
    accountantSign: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/accountant-sign`, data),
    approverSign: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/approver-sign`, data),
    directorSign: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/director-sign`, data),
    chiefAccountantSign: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/chief-accountant-sign`, data),
    departmentHeadSign: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/department-head-sign`, data),

    // Reject
    rejectPaymentRecord: (id: string, data?: { notes?: string }) => sendPut(`/payment-records/${id}/reject`, data),

    // Confirm Paid
    confirmPaid: (id: string) => sendPut(`/payment-records/${id}/confirm-paid`),

    // Export & Print
    exportPaymentRecord: (id: string) => sendGet(`/payment-records/${id}/export`),
    printPaymentRecord: (id: string) => sendGet(`/payment-records/${id}/print`),

    // Delete
    deletePaymentRecord: (id: string) => sendDelete(`/payment-records/${id}`),
};
