export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface ITask {
    _id: string;
    taskContent: string;
    assignerId: string;
    assignerName: string;
    assigneeId: string;
    assigneeName: string;
    startDate: string;
    deadline: string;
    status: TaskStatus;
    notes?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateTaskRequest {
    taskContent: string;
    assignerId: string;
    assigneeId: string;
    deadline: string;
    notes?: string;
}

export interface IUpdateTaskRequest {
    status?: TaskStatus;
    notes?: string;
}

export interface ITaskStatistics {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: string;
}

// SUB-MODULE 4B: Construction Logs
export interface IConstructionLog {
    _id: string;
    logDate: string;
    projectName: string;
    constructionName: string;
    constructionSite?: string; // Legacy field
    location: string;
    investor: string;
    supervisionConsultingUnit: string;
    constructionContractor: string;
    workingHours: {
        morning: { start: number; end: number };
        afternoon: { start: number; end: number };
    };
    weather: string;
    temperature: number;
    employeeCount: number;
    equipmentUsed: string;
    commander: string | { _id: string; employeeCode: string; fullName: string };
    supervisor?: string; // Legacy field
    supervisionUnit: string;
    supervisorName: string;
    workDescription: string;
    dailyWorkVolume?: string;
    mainWorkItems?: string;
    materialsHandoverB?: string;
    transitionalAcceptance?: string;
    notes?: string;
    supervisorNotes?: string;
    supervisorEvaluation?: {
        isScheduleOnTrack: boolean;
        isSufficientLaborAndEquipment: boolean;
        isConstructionQualityGood: boolean;
        laborSafetyStatus: "Tốt" | "Bình thường" | "Kém";
        environmentalSanitationStatus: "Tốt" | "Bình thường" | "Kém";
        nextDayWorkProposals: string;
        progressProposals: string;
    };
    images: string[];
    status: "active" | "closed" | "completed" | "updated";
    shiftEndTime?: string;
    shiftSummary?: string;
    shift?: string; // Legacy field
    workersPresent?: any[]; // Legacy field
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateLogRequest {
    logDate: string;
    projectName: string;
    constructionName: string;
    location: string;
    investor: string;
    supervisionConsultingUnit: string;
    constructionContractor: string;
    workingHours: {
        morning: { start: number; end: number };
        afternoon: { start: number; end: number };
    };
    weather: string;
    temperature: number;
    employeeCount: number;
    equipmentUsed: string;
    commander: string;
    supervisionUnit: string;
    supervisorName: string;
    workDescription: string;
    dailyWorkVolume?: string;
    mainWorkItems?: string;
    materialsHandoverB?: string;
    transitionalAcceptance?: string;
    notes?: string;
    supervisorNotes?: string;
    supervisorEvaluation?: {
        isScheduleOnTrack: boolean;
        isSufficientLaborAndEquipment: boolean;
        isConstructionQualityGood: boolean;
        laborSafetyStatus: "Tốt" | "Bình thường" | "Kém";
        environmentalSanitationStatus: "Tốt" | "Bình thường" | "Kém";
        nextDayWorkProposals: string;
        progressProposals: string;
    };
    images?: string[];
}

export interface IAutocompleteData {
    projects: string[];
    sites: string[];
    supervisors: string[];
}
