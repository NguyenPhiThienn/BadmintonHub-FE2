import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EquipmentFormData {
    equipmentCode: string;
    equipmentName: string;
    serialNumber: string;
    manufacturer: string;
    quantity: number;
    availableQuantity: number;
    status: string;
    inspectionSealNumber: string;
    inspectionDate: string;
    nextInspectionDate: string;
    notes: string;
}

interface EquipmentFormStore {
    formData: EquipmentFormData;
    setFormData: (data: Partial<EquipmentFormData>) => void;
    resetFormData: () => void;
}

const initialFormData: EquipmentFormData = {
    equipmentCode: "",
    equipmentName: "",
    serialNumber: "",
    manufacturer: "",
    quantity: 1,
    availableQuantity: 1,
    status: "",
    inspectionSealNumber: "",
    inspectionDate: "",
    nextInspectionDate: "",
    notes: "",
};

export const useEquipmentFormStore = create<EquipmentFormStore>()(
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
            name: "equipment-form-storage",
        }
    )
);
