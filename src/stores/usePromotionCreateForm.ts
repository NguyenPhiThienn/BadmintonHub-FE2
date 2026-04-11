import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PromotionFormData {
    code: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: string;
    minOrderValue: string;
    maxDiscountAmount: string;
    startDate: string;
    endDate: string;
    applicableVehicles: string[];
    usageLimit: string;
}

interface PromotionCreateFormState {
    formData: PromotionFormData;
    errors: Record<string, string>;
    setFormData: (formData: PromotionFormData) => void;
    updateFormData: (updates: Partial<PromotionFormData>) => void;
    setErrors: (errors: Record<string, string>) => void;
    resetForm: () => void;
}

const initialFormData: PromotionFormData = {
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    applicableVehicles: ["BIKE", "VAN", "TRUCK"],
    usageLimit: "",
};

export const usePromotionCreateForm = create<PromotionCreateFormState>()(
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
            name: "promotion-create-form-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
