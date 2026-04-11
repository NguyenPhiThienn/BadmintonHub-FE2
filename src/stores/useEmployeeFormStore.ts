import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmployeeFormData {
    employeeCode: string;
    fullName: string;
    dateOfBirth: string;
    hometown: string;
    phoneNumber: string;
    department: string;
    position: string;
    identityCard: string;
    qualification: string;
    isActive: boolean;
    digitalSignature: string;
    password?: string;
}

interface EmployeeFormStore {
    formData: EmployeeFormData;
    setFormData: (data: Partial<EmployeeFormData>) => void;
    resetFormData: () => void;
}

const initialFormData: EmployeeFormData = {
    employeeCode: "",
    fullName: "",
    dateOfBirth: "",
    hometown: "",
    phoneNumber: "",
    department: "",
    position: "",
    identityCard: "",
    qualification: "",
    isActive: true,
    digitalSignature: "",
    password: "",
};

export const useEmployeeFormStore = create<EmployeeFormStore>()(
    persist(
        (set) => ({
            formData: initialFormData,
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),
            resetFormData: () => set({ formData: initialFormData }),
        }),
        {
            name: "employee-form-storage",
        }
    )
);
