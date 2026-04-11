import { sendGet, sendPost, sendPut, sendDelete } from "./axios";
import { ICreateContractRequest, IUpdateContractRequest } from "@/interface/contract";

export const contractApi = {
    getContracts: (params: any) => sendGet("/contracts", params),
    getContractDetails: (id: string) => sendGet(`/contracts/${id}`),
    createContract: (data: ICreateContractRequest) => sendPost("/contracts", data),
    updateContract: (id: string, data: IUpdateContractRequest) => sendPut(`/contracts/${id}`, data),
    deleteContract: (id: string) => sendDelete(`/contracts/${id}`),
    searchContracts: (params: any) => sendGet("/contracts/search", params),
};
