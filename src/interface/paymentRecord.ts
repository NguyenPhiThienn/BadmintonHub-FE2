export type PaymentRecordType = "PAYMENT" | "ADVANCE";
export type PaymentRecordStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PopulatedEmployee {
    _id: string;
    fullName: string;
    employeeCode?: string;
    position?: string;
    department?: string;
    phoneNumber?: string;
    digitalSignature?: string;
}

export interface IPaymentRecord {
    _id: string;
    recordCode: string;
    type: PaymentRecordType;
    status: PaymentRecordStatus;

    requesterId: PopulatedEmployee | string;
    requesterName?: string;
    amount: number;

    // PAYMENT type fields
    content?: string;
    attachment?: string;
    attachmentFile?: string;
    accountantId?: PopulatedEmployee | string;
    isAccountantSigned?: boolean;
    accountantSignedAt?: string | null;
    approverId?: PopulatedEmployee | string;
    isApproverSigned?: boolean;
    approverSignedAt?: string | null;

    // ADVANCE type fields
    projectName?: string;
    projectAddress?: string;
    directorId?: PopulatedEmployee | string;
    isDirectorSigned?: boolean;
    directorSignedAt?: string | null;
    chiefAccountantId?: PopulatedEmployee | string;
    isChiefAccountantSigned?: boolean;
    chiefAccountantSignedAt?: string | null;
    departmentHeadId?: PopulatedEmployee | string;
    isDepartmentHeadSigned?: boolean;
    departmentHeadSignedAt?: string | null;

    notes?: string;
    createdAt: string;
    updatedAt: string;
}
