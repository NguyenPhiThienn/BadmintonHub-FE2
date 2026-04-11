import { sendGet, sendPut, sendDelete, sendPost } from "./axios";

export const bayApi = {
    getBays: (params: any) => sendGet("/bays", params),
    getBaysByVoltageLevel: (voltageLevelId: string) => sendGet(`/bays/voltage-level/${voltageLevelId}`),
    getBayDetails: (id: string) => sendGet(`/bays/${id}`),
    createBay: (data: any) => sendPost("/bays", data),
    updateBay: (id: string, data: any) => sendPut(`/bays/${id}`, data),
    deleteBay: (id: string) => sendDelete(`/bays/${id}`),
};
