import { IMergeTableConfig } from "@/components/TestingConfigPage/CategoryDialog/TableBuilder";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TableBuilderStore {
    tableConfigs: Record<string, IMergeTableConfig>; // Key would be category ID or a temporary key
    setTableConfig: (key: string, config: IMergeTableConfig) => void;
    clearTableConfig: (key: string) => void;
    resetAll: () => void;
}

export const useTableBuilderStore = create<TableBuilderStore>()(
    persist(
        (set) => ({
            tableConfigs: {},
            setTableConfig: (key, config) =>
                set((state) => ({
                    tableConfigs: { ...state.tableConfigs, [key]: config },
                })),
            clearTableConfig: (key) =>
                set((state) => {
                    const newConfigs = { ...state.tableConfigs };
                    delete newConfigs[key];
                    return { tableConfigs: newConfigs };
                }),
            resetAll: () => set({ tableConfigs: {} }),
        }),
        {
            name: "table-builder-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
