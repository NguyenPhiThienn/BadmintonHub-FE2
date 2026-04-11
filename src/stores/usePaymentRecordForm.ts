import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ─── PAYMENT form ─────────────────────────────────────────────────────────────

interface PaymentFormData {
    content: string;
    amount: string;
    attachment: string;
    attachmentFile: string;
}

interface AdvanceFormData {
    projectName: string;
    projectAddress: string;
    amount: string;
    attachmentFile: string;
}

interface PaymentRecordFormState {
    paymentForm: PaymentFormData;
    advanceForm: AdvanceFormData;
    activeTab: "PAYMENT" | "ADVANCE";
    setPaymentForm: (data: Partial<PaymentFormData>) => void;
    setAdvanceForm: (data: Partial<AdvanceFormData>) => void;
    setActiveTab: (tab: "PAYMENT" | "ADVANCE") => void;
    resetPaymentForm: () => void;
    resetAdvanceForm: () => void;
    resetAll: () => void;
}

const initialPaymentForm: PaymentFormData = {
    content: "",
    amount: "",
    attachment: "",
    attachmentFile: "",
};

const initialAdvanceForm: AdvanceFormData = {
    projectName: "",
    projectAddress: "",
    amount: "",
    attachmentFile: "",
};

export const usePaymentRecordForm = create<PaymentRecordFormState>()(
    persist(
        (set) => ({
            paymentForm: initialPaymentForm,
            advanceForm: initialAdvanceForm,
            activeTab: "PAYMENT",
            setPaymentForm: (data) =>
                set((state) => ({
                    paymentForm: { ...state.paymentForm, ...data },
                })),
            setAdvanceForm: (data) =>
                set((state) => ({
                    advanceForm: { ...state.advanceForm, ...data },
                })),
            setActiveTab: (tab) => set({ activeTab: tab }),
            resetPaymentForm: () => set({ paymentForm: initialPaymentForm }),
            resetAdvanceForm: () => set({ advanceForm: initialAdvanceForm }),
            resetAll: () =>
                set({
                    paymentForm: initialPaymentForm,
                    advanceForm: initialAdvanceForm,
                    activeTab: "PAYMENT",
                }),
        }),
        {
            name: "payment-record-form-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
