import { sendGet, sendPost, sendPut, sendDelete } from "./axios";
import { ICreateDocumentRequest, IUpdateDocumentRequest, IDocumentsResponse } from "@/interface/document";

export const documentApi = {
    getDocuments: (params: any): Promise<IDocumentsResponse> => sendGet("/documents", params),

    getDocumentDetails: (id: string): Promise<any> => sendGet(`/documents/${id}`),

    createDocument: (data: ICreateDocumentRequest): Promise<any> => sendPost("/documents", data),

    updateDocument: (id: string, data: IUpdateDocumentRequest): Promise<any> => sendPut(`/documents/${id}`, data),

    deleteDocument: (id: string): Promise<any> => sendDelete(`/documents/${id}`),
};
