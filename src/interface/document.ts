import { IPartner } from "./partner";

export type DocumentType = "incoming" | "outgoing" | "notification" | "decision" | "template" | "construction_profile" | "guide";

export interface IDocument {
    _id: string;
    title: string;
    documentNumber: string;
    type: DocumentType;
    partner?: string | IPartner;
    fileUrl: string;
    publicId?: string;
    receivedDate?: string;
    issuedDate?: string;
    sender?: string;
    receiver?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateDocumentRequest {
    title: string;
    documentNumber: string;
    type: DocumentType;
    fileUrl: string;
    publicId: string;
    description?: string;
    issuedDate?: string;
    receivedDate?: string;
    sender?: string;
    receiver?: string;
    partner?: string;
}

export interface IUpdateDocumentRequest extends Partial<ICreateDocumentRequest> { }

export interface IDocumentsResponse {
    statusCode: number;
    message: string;
    data: {
        documents: IDocument[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
