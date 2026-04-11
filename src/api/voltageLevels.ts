import { sendGet, sendPut, sendDelete, sendPost } from "./axios";

export const voltageLevelApi = {
    getVoltageLevels: (params: any) => sendGet("/voltage-levels", params),
    getVoltageLevelDetails: (id: string) => sendGet(`/voltage-levels/${id}`),
    createVoltageLevel: (data: any) => sendPost("/voltage-levels", data),
    updateVoltageLevel: (id: string, data: any) => sendPut(`/voltage-levels/${id}`, data),
    deleteVoltageLevel: (id: string) => sendDelete(`/voltage-levels/${id}`),
    getVoltageLevelsByPartner: (partnerId: string) => sendGet(`/voltage-levels/partner/${partnerId}`),
};
