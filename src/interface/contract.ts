export type ContractStatus = "unpaid" | "paid" | "advanced";

export interface IContract {
    _id: string;
    contractNumber: string;
    contractFile?: string;
    constructionItem: string;
    partner: string | {
        _id: string;
        partnerName: string;
        taxCode?: string;
        name?: string; // Adding name for compatibility with user description
    };
    signingDate: string;
    status: ContractStatus;
    finalizationDate: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateContractRequest {
    contractNumber: string;
    contractFile?: string;
    constructionItem: string;
    partner: string; // Partner ID
    signingDate: string;
    status: ContractStatus;
    finalizationDate: string;
}

export interface IUpdateContractRequest extends Partial<ICreateContractRequest> { }

export interface IContractListResponse {
    contracts: IContract[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}
