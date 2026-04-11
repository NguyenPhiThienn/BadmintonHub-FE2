import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkingHours {
    morning: { start: number; end: number };
    afternoon: { start: number; end: number };
}

type StatusLevel = "Tốt" | "Bình thường" | "Kém";

interface SupervisorEvaluation {
    isScheduleOnTrack: boolean;
    isSufficientLaborAndEquipment: boolean;
    isConstructionQualityGood: boolean;
    laborSafetyStatus: StatusLevel;
    environmentalSanitationStatus: StatusLevel;
    nextDayWorkProposals: string;
    progressProposals: string;
}

interface ConstructionLogFormData {
    logDate: string;
    projectName: string;
    constructionName: string;
    location: string;
    investor: string;
    supervisionConsultingUnit: string;
    constructionContractor: string;
    workingHours: WorkingHours;
    weather: string;
    temperature: number;
    employeeCount: number;
    commander: string;
    supervisionUnit: string;
    supervisorName: string;
    workDescription: string;
    dailyWorkVolume: string;
    mainWorkItems: string;
    materialsHandoverB: string;
    transitionalAcceptance: string;
    equipmentUsed: string;
    notes: string;
    supervisorNotes: string;
    supervisorEvaluation: SupervisorEvaluation;
}

interface ConstructionLogsFormStore {
    formData: ConstructionLogFormData;
    setFormData: (data: Partial<Omit<ConstructionLogFormData, "supervisorEvaluation">> & {
        supervisorEvaluation?: Partial<SupervisorEvaluation>
    }) => void;
    resetFormData: () => void;
}

const initialFormData: ConstructionLogFormData = {
    logDate: new Date().toISOString().split("T")[0],
    projectName: "",
    constructionName: "",
    location: "",
    investor: "",
    supervisionConsultingUnit: "",
    constructionContractor: "",
    workingHours: {
        morning: { start: 7, end: 11 },
        afternoon: { start: 13, end: 17 },
    },
    weather: "Nắng",
    temperature: 30,
    employeeCount: 0,
    commander: "",
    supervisionUnit: "",
    supervisorName: "",
    workDescription: "",
    dailyWorkVolume: "",
    mainWorkItems: "",
    materialsHandoverB: "",
    transitionalAcceptance: "",
    equipmentUsed: "",
    notes: "",
    supervisorNotes: "",
    supervisorEvaluation: {
        isScheduleOnTrack: false,
        isSufficientLaborAndEquipment: false,
        isConstructionQualityGood: false,
        laborSafetyStatus: "Bình thường",
        environmentalSanitationStatus: "Bình thường",
        nextDayWorkProposals: "",
        progressProposals: "",
    },
};

export const useConstructionLogsForm = create<ConstructionLogsFormStore>()(
    persist(
        (set, get) => ({
            formData: initialFormData,
            setFormData: (data) =>
                set((state) => ({
                    formData: {
                        ...initialFormData,
                        ...state.formData,
                        ...data,
                        supervisorEvaluation: {
                            ...initialFormData.supervisorEvaluation,
                            ...(state.formData.supervisorEvaluation ?? {}),
                            ...(data.supervisorEvaluation ?? {}),
                        },
                    } as ConstructionLogFormData,
                })),
            resetFormData: () => set({ formData: initialFormData }),
        }),
        {
            name: "construction-logs-form-storage-v2",
        }
    )
);
