export interface IFileRecord {
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    createdAt?: string;
}

export interface IDeviceType {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    templateFile?: IFileRecord;
    generatedFile?: IFileRecord;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateDeviceTypeRequest {
    name: string;
    description?: string;
}

export interface IUpdateDeviceTypeRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
    templateFile?: IFileRecord;
    generatedFile?: IFileRecord;
}

export type TestContentType = "GROUP" | "TABLE" | "TEXT" | "IMAGE" | "NUMBER" | "DROPDOWN" | "MERGE_TABLE";

export interface ITestCategoryConfigItem {
    name: string;
    unit?: string;
}

export interface ITestCategory {
    _id: string;
    deviceTypeId: string;
    parentId: string | null;
    name: string;
    standardValue?: string;
    allowCharting?: boolean;
    contentType: TestContentType;
    order: number;
    config?: ITestCategoryConfigItem[] | any;
    isActive: boolean;
    children?: ITestCategory[];
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateTestCategoryRequest {
    deviceTypeId: string;
    parentId: string | null;
    name: string;
    standardValue?: string;
    allowCharting?: boolean;
    contentType: TestContentType;
    order: number;
    config?: any;
}

export interface IUpdateTestCategoryRequest {
    name?: string;
    standardValue?: string;
    allowCharting?: boolean;
    contentType?: TestContentType;
    config?: any;
    isActive?: boolean;
}

export interface ITestingDevice {
    _id: string;
    operatingName: string;
    designatedName?: string;
    equipmentCode: string;
    site?: string;
    deviceTypeId: string | IDeviceType;
    partnerId: string | any;
    voltageLevelId: string | any;
    bayId?: string | any;
    manufacturer?: string;
    serialJson?: string;
    commissioningDate?: string;
    testCycle: number;
    warrantyMonths?: number;
    lastTestDate?: string;
    isActive: boolean;
    productionYear?: number;
    deviceModel?: string;
    accuracyClass?: string;
    capacity?: string;
    nominalVoltage?: number;
    capacitance?: string;
    transformationRatio?: string;
    nominalCurrent?: number;
    shortCircuitCurrent?: number;
    nominalDischargeCurrent?: string;
    continuousOperatingVoltage?: string;
    leakageCurrentScale?: string;
    vectorGroup?: string;
    protectionObject?: string;
    testLocation?: string;
    settingOrder?: string;
    lineVtRatio?: string;
    busVtRatio?: string;
    ctRatio1?: string;
    ctRatio2?: string;
    ctRatio3?: string;
    hvWinding?: string;
    mvWinding?: string;
    lvWinding?: string;
    cableSize?: string;
    cableType?: string;
    quantity?: number;
    images?: string[];
    records?: ITestingDeviceRecord[];
    technicalDocuments?: ITestingDeviceRecord[];
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ITestingDeviceRecord {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    createdAt?: string;
}

export interface ICreateTestingDeviceRequest {
    operatingName: string;
    designatedName?: string;
    equipmentCode: string;
    site?: string;
    deviceTypeId: string;
    partnerId: string;
    voltageLevelId: string;
    bayId?: string;
    manufacturer?: string;
    serialJson?: string;
    commissioningDate?: string;
    testCycle: number;
    warrantyMonths?: number;
    lastTestDate?: string;
    // New fields
    productionYear?: number;
    deviceModel?: string;
    accuracyClass?: string;
    capacity?: string;
    nominalVoltage?: number;
    capacitance?: string;
    transformationRatio?: string;
    nominalCurrent?: number;
    shortCircuitCurrent?: number;
    nominalDischargeCurrent?: string;
    continuousOperatingVoltage?: string;
    leakageCurrentScale?: string;
    vectorGroup?: string;
    protectionObject?: string;
    testLocation?: string;
    settingOrder?: string;
    lineVtRatio?: string;
    busVtRatio?: string;
    ctRatio1?: string;
    ctRatio2?: string;
    ctRatio3?: string;
    hvWinding?: string;
    mvWinding?: string;
    lvWinding?: string;
    cableSize?: string;
    cableType?: string;
    quantity?: number;
}

export interface IUpdateTestingDeviceRequest extends Partial<ICreateTestingDeviceRequest> {
    isActive?: boolean;
    records?: ITestingDeviceRecord[];
    technicalDocuments?: ITestingDeviceRecord[];
}

export interface IGetTestingDevicesParams {
    page?: number;
    limit?: number;
    partnerId?: string;
    deviceTypeId?: string;
    voltageLevelId?: string;
    bayId?: string;
    search?: string;
}

export interface ITestResultItem {
    evaluation: string;
    isSkipped: boolean;
    value: any; // Can be string, number, or array of objects for TABLE
}

export interface ITestJob {
    _id: string;
    deviceId: string | ITestingDevice;
    projectName: string;
    site?: string;
    reportNumber: string;
    testDate: string;
    testType: string;
    reinforcementContent?: string;
    temperature?: string;
    humidity?: string;
    testerName: string;
    testerId?: {
        _id: string;
        fullName: string;
        digitalSignature?: string;
    };
    approverName: string;
    approverId?: {
        _id: string;
        fullName: string;
        digitalSignature?: string;
    };
    directorName?: string;
    directorId?: {
        _id: string;
        fullName: string;
        digitalSignature?: string;
    };
    status: string;
    conclusion?: string;
    failReason?: string;
    notes?: string;
    purpose?: string;
    testingTools?: string;
    testResults?: Record<string, ITestResultItem>;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateTestJobRequest {
    deviceId: string;
    projectName: string;
    site?: string;
    reportNumber: string;
    testDate: string;
    testType: string;
    reinforcementContent?: string;
    temperature?: string;
    humidity?: string;
    testerName: string;
    approverName: string;
    directorName?: string;
    status: string;
    conclusion?: string;
    failReason?: string;
    notes?: string;
    purpose?: string;
    testingTools?: string;
    testResults?: Record<string, any>;
}

export interface IUpdateTestJobRequest extends Partial<ICreateTestJobRequest> {
    isActive?: boolean;
}

export interface IGetTestJobsParams {
    page?: number;
    limit?: number;
    deviceId?: string;
    status?: string;
    search?: string;
}

export interface IGroupedTestJob {
    partnerId: string;
    partnerName: string;
    years: {
        year: number;
        bays: {
            bayId: string;
            bayName: string;
            testJobs: {
                _id: string;
                operatingName: string;
                createdAt: string;
            }[];
        }[];
    }[];
}
