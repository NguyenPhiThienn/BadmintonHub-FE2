import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TestingJobFormData {
    deviceId: string;
    projectName: string;
    site: string;
    reportNumber: string;
    testDate: string;
    testType: string;
    reinforcementContent: string;
    temperature: string;
    humidity: string;
    testerName: string;
    approverName: string;
    status: string;
    conclusion: string;
    failReason: string;
    notes: string;
    purpose: string;
    testingTools: string[];
    testResults: Record<string, any>;
}

interface TestingJobFormStore {
    formData: TestingJobFormData;
    activeTab: string;
    setFormData: (data: Partial<TestingJobFormData>) => void;
    setActiveTab: (tab: string) => void;
    setTestingTools: (tools: string[]) => void;
    setTestResults: (results: Record<string, any>) => void;
    resetFormData: (deviceId?: string) => void;
    setAllFormData: (data: TestingJobFormData) => void;
}

const initialFormData: TestingJobFormData = {
    deviceId: "",
    projectName: "",
    site: "",
    reportNumber: "",
    testDate: new Date().toISOString().split("T")[0],
    testType: "Định kỳ",
    reinforcementContent: "",
    temperature: "",
    humidity: "",
    testerName: "",
    approverName: "",
    status: "Đạt",
    conclusion: "",
    failReason: "",
    notes: "",
    purpose: "",
    testingTools: [""],
    testResults: {},
};

export const useTestingJobFormStore = create<TestingJobFormStore>()(
    persist(
        (set) => ({
            formData: initialFormData,
            activeTab: "info",
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),
            setActiveTab: (tab) => set({ activeTab: tab }),
            setTestingTools: (tools) =>
                set((state) => ({
                    formData: { ...state.formData, testingTools: tools },
                })),
            setTestResults: (results) =>
                set((state) => ({
                    formData: { ...state.formData, testResults: results },
                })),
            resetFormData: (deviceId) =>
                set({
                    formData: { ...initialFormData, deviceId: deviceId || "" },
                    activeTab: "info",
                }),
            setAllFormData: (data) =>
                set({
                    formData: data,
                    activeTab: "info",
                }),
        }),
        {
            name: "testing-job-form-storage",
        }
    )
);
