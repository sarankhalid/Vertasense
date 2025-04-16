"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  openGroups: Record<string, boolean>;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  toggleGroup: (label: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      openGroups: { Frameworks: true },
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      toggleGroup: (label) => set((state) => ({
        openGroups: {
          ...state.openGroups,
          [label]: !state.openGroups[label]
        }
      })),
    }),
    {
      name: "sidebar-storage",
    }
  )
);
