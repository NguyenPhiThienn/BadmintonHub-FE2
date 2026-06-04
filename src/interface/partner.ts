export interface IContact {
    _id?: string;
    name: string;
    phoneNumber: string;
    username?: string;
}

export interface IPartner {
    _id: string;
    partnerName: string;
    address: string;
    contacts: IContact[];
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreatePartnerRequest {
    partnerName: string;
    address: string;
    contacts: IContact[];
}

export interface IUpdatePartnerRequest {
    partnerName?: string;
    address?: string;
    contacts?: IContact[];
    isActive?: boolean;
}

// SUB-MODULE 5B: Construction Plans
export interface IConstructionPlan {
    _id: string;
    partnerId: string;
    partnerName: string;
    constructionPlansFileUrl: string;
    description: string;
    uploadedBy: string;
    isActive: boolean;
    uploadedAt: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface ICreateConstructionPlanRequest {
    partnerId: string;
    description: string;
    constructionPlansFileUrl: string;
}

export interface IUpdateConstructionPlanRequest {
    description?: string;
    constructionPlansFileUrl?: string;
}
