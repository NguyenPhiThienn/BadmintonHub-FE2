export interface IJobPlanFileVersion {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    createdAt?: string;
}

export interface IJobPlanVersion {
    _id?: string;
    name: string;
    notes: string;
    files?: IJobPlanFileVersion[];
    createdAt?: string;
    createdBy?: string | {
        _id: string;
        fullName: string;
    };
}

export interface IJobPlanUser {
    _id: string;
    fullName: string;
    avatar?: string;
    role?: string;
}

export interface IJobPlanMessage {
    _id: string;
    jobPlanId: string;
    content: string;
    sender: string | IJobPlanUser;
    type: "text" | "file" | "system";
    fileUrl?: string;
    fileMetadata?: {
        fileName: string;
        fileSize: number;
        fileType: string;
    };
    createdAt: string;
    updatedAt?: string;
}

export interface IJobPlan {
    _id: string;
    planName: string;
    partnerId: string | {
        _id: string;
        partnerName: string;
        address?: string;
    };
    summary: string;
    status: string;
    versions?: IJobPlanVersion[];
    messages?: IJobPlanMessage[];
    createdBy?: string | any;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateJobPlanRequest {
    planName: string;
    partnerId: string;
    summary: string;
    status: string;
}

export interface IUpdateJobPlanRequest {
    planName?: string;
    partnerId?: string;
    summary?: string;
    status?: string;
}

export interface IGetJobPlanParams {
    page?: number;
    limit?: number;
    partnerId?: string;
    status?: string;
    search?: string;
}

export interface ICreateJobPlanVersionRequest {
    name: string;
    notes: string;
    files?: IJobPlanFileVersion[];
}

export interface IUpdateJobPlanVersionRequest {
    name: string;
    notes: string;
    files?: IJobPlanFileVersion[];
}

export interface ISendJobPlanMessageRequest {
    content: string;
    type?: "text" | "file" | "system";
    fileUrl?: string;
    fileMetadata?: {
        fileName: string;
        fileSize: number;
        fileType: string;
    };
}
