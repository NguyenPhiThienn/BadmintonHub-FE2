export type AttendanceType =
    | "present"
    | "business_trip"
    | "compensatory_leave"
    | "annual_leave"
    | "sick_leave"
    | "maternity_leave";

export interface IAttendanceRecord {
    _id: string;
    employeeId: string | {
        _id: string;
        fullName: string;
        employeeCode: string;
        department: string;
        position: string;
        avatar?: string;
    };
    employeeName: string;
    employeeCode: string;
    date: string;
    type: AttendanceType;
    isLocked: boolean;
    notes?: string;
    businessTripNotes?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAttendanceCheckInItem {
    employeeId: string;
    type: AttendanceType;
    notes?: string;
    businessTripNotes?: string;
}

export interface IAttendanceCheckInPayload {
    date: string;
    items: IAttendanceCheckInItem[];
}

export interface IAttendanceSummary {
    totalWorkDays: number;
    totalBusinessTrip: number;
    totalCompensatoryLeave: number;
    totalWeekendWork: number;
    totalPaidLeave: number;
    totalAnnualLeave: number;
    totalSickLeave: number;
    totalMaternityLeave: number;
    totalAttendance: number;
    surplusDays: number;
    businessTripNotes?: string[];
}

export interface IMonthlySummaryEmployee {
    employee: {
        _id: string;
        fullName: string;
        employeeCode: string;
        department: string;
        position: string;
    };
    records: {
        _id: string;
        date: string;
        type: AttendanceType;
        isLocked: boolean;
        notes?: string;
        businessTripNotes?: string;
    }[];
    summary: IAttendanceSummary;
    signature: {
        signedBy: {
            _id: string;
            fullName: string;
            employeeCode: string;
        };
        digitalSignature: string;
        signedAt: string;
    } | null;
}

export const ATTENDANCE_TYPE_LABELS: Record<AttendanceType, string> = {
    present: "VP - Làm tại văn phòng",
    business_trip: "CT - Công tác",
    compensatory_leave: "NB - Nghỉ bù",
    annual_leave: "P - Nghỉ phép",
    sick_leave: "O - Nghỉ ốm",
    maternity_leave: "TS - Nghỉ thai sản",
};

export const ATTENDANCE_TYPE_SYMBOLS: Record<AttendanceType, string> = {
    present: "VP",
    business_trip: "CT",
    compensatory_leave: "NB",
    annual_leave: "P",
    sick_leave: "O",
    maternity_leave: "TS",
};

export const ATTENDANCE_TYPE_COLORS: Record<AttendanceType, string> = {
    present: "green",
    business_trip: "indigo",
    compensatory_leave: "orange",
    annual_leave: "blue",
    sick_leave: "amber",
    maternity_leave: "pink",
};
