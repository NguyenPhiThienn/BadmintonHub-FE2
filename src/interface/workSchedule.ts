export enum WorkScheduleStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    OTHER = 'other',
}

export interface IUpdateHistory {
    updatedAt: string;
    updatedBy: string | {
        fullName: string;
        username: string;
    };
    workContent: string;
    status: WorkScheduleStatus;
    result?: string | null;
    notes?: string | null;
}

export interface IWorkSchedule {
    _id: string;
    employeeId: string | {
        _id: string;
        employeeCode: string;
        fullName: string;
        department: string;
        position: string;
    };
    employeeName?: string;
    employeeCode?: string;
    department?: string;
    position?: string;
    date: string;
    workContent: string;
    status: WorkScheduleStatus;
    result?: string | null;
    notes?: string | null;
    updateHistory?: IUpdateHistory[];
    createdBy: string | {
        _id?: string;
        username: string;
    };
    updatedBy: string | {
        _id?: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IWorkScheduleCreate {
    employeeId: string;
    date: string;
    workContent: string;
    status?: WorkScheduleStatus;
    result?: string;
    notes?: string;
}

export interface IWorkScheduleUpdate {
    employeeId?: string;
    date?: string;
    workContent?: string;
    status?: WorkScheduleStatus;
    result?: string;
    notes?: string;
}

export interface IWorkScheduleSearchParams {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: WorkScheduleStatus;
    page?: number;
    limit?: number;
}

export interface IWorkScheduleCalendarParams {
    month: number;
    year: number;
    employeeId?: string;
}

export interface IWorkScheduleCalendarDay {
    date: string;
    schedules: IWorkSchedule[];
}

export interface IWorkScheduleStatistics {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    other: number;
}

export interface IWorkScheduleEmployeeData {
    employee: {
        _id: string;
        employeeCode: string;
        fullName: string;
        department: string;
        position: string;
    };
    schedules: IWorkSchedule[];
    statistics: IWorkScheduleStatistics;
}
