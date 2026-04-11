import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ICreateUserBody } from "@/interface/auth";

interface UserCreateFormState {
    formData: ICreateUserBody;
    errors: Record<string, string>;
    setFormData: (formData: ICreateUserBody) => void;
    updateFormData: (updates: Partial<ICreateUserBody>) => void;
    setErrors: (errors: Record<string, string>) => void;
    resetForm: () => void;
}

const initialFormData: ICreateUserBody = {
    name: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
    role: "CUSTOMER",
    active: true,
    walletBalance: 0,
    rating: 5,
    vehicleType: "BIKE",
    plateNumber: "",
    licenseImage: "",
    identityNumber: "",
    identityFrontImage: "",
    identityBackImage: "",
    vehicleRegistrationImage: "",
    drivingLicenseNumber: "",
    bankInfo: {
        bankName: "",
        accountNumber: "",
        accountHolder: "",
    },
};

export const useUserCreateForm = create<UserCreateFormState>()(
    persist(
        (set) => ({
            formData: initialFormData,
            errors: {},
            setFormData: (formData) => set({ formData }),
            updateFormData: (updates) =>
                set((state) => ({
                    formData: { ...state.formData, ...updates },
                })),
            setErrors: (errors) => set({ errors }),
            resetForm: () =>
                set({
                    formData: initialFormData,
                    errors: {},
                }),
        }),
        {
            name: "user-create-form-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
