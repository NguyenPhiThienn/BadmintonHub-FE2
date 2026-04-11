import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TestingDeviceFormData {
    operatingName: string;
    designatedName: string;
    equipmentCode: string;
    site?: string;
    deviceTypeId: string;
    partnerId: string;
    voltageLevelId: string;
    bayId: string;
    manufacturer: string;
    testCycle: number;
    warrantyMonths: number;
    commissioningDate?: string;
    lastTestDate?: string;
    serialJson: string;
    // Special fields for VT/CT
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
    // Overcurrent protection specific fields
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

interface TestingDeviceFormStore {
    formData: TestingDeviceFormData;
    serialRows: number;
    serialCols: number;
    serialData: Record<string, string>;
    setFormData: (updates: Partial<TestingDeviceFormData>) => void;
    setSerialRows: (rows: number) => void;
    setSerialCols: (cols: number) => void;
    setSerialData: (data: Record<string, string>) => void;
    resetFormData: () => void;
}

const initialFormData: TestingDeviceFormData = {
    operatingName: "",
    designatedName: "",
    equipmentCode: "",
    site: "",
    deviceTypeId: "",
    partnerId: "",
    voltageLevelId: "",
    bayId: "",
    manufacturer: "",
    testCycle: 3,
    warrantyMonths: 12,
    commissioningDate: undefined,
    lastTestDate: undefined,
    serialJson: "",
    productionYear: undefined,
    deviceModel: "",
    accuracyClass: "",
    capacity: "",
    nominalVoltage: undefined,
    capacitance: "",
    transformationRatio: "",
    nominalCurrent: undefined,
    shortCircuitCurrent: undefined,
    nominalDischargeCurrent: "",
    continuousOperatingVoltage: "",
    leakageCurrentScale: "",
    vectorGroup: "",
    protectionObject: "",
    testLocation: "",
    settingOrder: "",
    lineVtRatio: "",
    busVtRatio: "",
    ctRatio1: "",
    ctRatio2: "",
    ctRatio3: "",
    hvWinding: "",
    mvWinding: "",
    lvWinding: "",
    cableSize: "",
    cableType: "",
    quantity: 1,
};

export const useTestingDeviceFormStore = create<TestingDeviceFormStore>()(
    persist(
        (set) => ({
            formData: initialFormData,
            serialRows: 1,
            serialCols: 1,
            serialData: {},
            setFormData: (updates) =>
                set((state) => ({
                    formData: { ...state.formData, ...updates },
                })),
            setSerialRows: (serialRows) => set({ serialRows }),
            setSerialCols: (serialCols) => set({ serialCols }),
            setSerialData: (serialData) => set({ serialData }),
            resetFormData: () =>
                set({
                    formData: initialFormData,
                    serialRows: 1,
                    serialCols: 1,
                    serialData: {},
                }),
        }),
        {
            name: "testing-device-form-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
