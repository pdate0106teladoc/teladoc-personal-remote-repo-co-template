import {create} from 'zustand';
import { persist } from 'zustand/middleware';

interface KillSwitchStore {
  killSwitchStatus: boolean;
  setKillSwitchStatus: (status: boolean) => void;
}

export const useKillSwitchStore = create<KillSwitchStore>()(
  persist(
    (set) => ({
      killSwitchStatus: false,
      setKillSwitchStatus: (status: boolean) => set({ killSwitchStatus: status }),
    }),
    {
      name: 'kill-switch-storage', 
    }
  )
);
