import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedItem {
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    quantity: number;
    borrowCondition: string;
    borrowImages: string[];
}

interface BorrowFormData {
    projectName: string;
    borrowerId: string;
    borrowDate: string;
    returnDate: string | null;
    notes: string;
    selectedItems: SelectedItem[];
}

interface BorrowFormStore {
    formData: BorrowFormData;
    setFormData: (data: Partial<BorrowFormData>) => void;
    setSelectedItems: (items: SelectedItem[]) => void;
    resetFormData: () => void;
}

const initialFormData: BorrowFormData = {
    projectName: "",
    borrowerId: "",
    borrowDate: new Date().toISOString(),
    returnDate: null,
    notes: "",
    selectedItems: [],
};

export const useBorrowFormStore = create<BorrowFormStore>()(
    persist(
        (set) => ({
            formData: initialFormData,
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),
            setSelectedItems: (items) =>
                set((state) => ({
                    formData: { ...state.formData, selectedItems: items },
                })),
            resetFormData: () => set({ formData: initialFormData }),
        }),
        {
            name: "borrow-form-storage",
        }
    )
);
