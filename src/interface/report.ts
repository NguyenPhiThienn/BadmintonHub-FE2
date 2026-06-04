export interface INotification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    priority: "low" | "medium" | "high";
    createdAt: string;
    readAt?: string;
}

export interface IEquipmentReport {
    total: number;
    available: number;
    maintenance: number;
    totalValue: number;
    availabilityRate: string;
}

export interface ITaskReport {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: string;
}

export interface IBorrowReturnReport {
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
}

export interface IExportReportResponse {
    reportType: string;
    generatedAt: string;
    exportUrl: string;
}
