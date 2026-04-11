import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AddressState {
	account: string | null;
	setAccount: (account: string | null) => void;
}

export const useAddress = create<AddressState>()(
	persist(
		(set) => ({
			account: null,
			setAccount: (account) => set({ account }),
		}),
		{
			name: "account-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);






