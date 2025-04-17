"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types for organization and role
export interface Organization {
  id: string;
  name: string;
  type?: string; // Type of organization (COMPANY or CONSULTING_FIRM)
  role?: UserRole; // Role associated with this organization
  // Add other organization properties as needed
}

type UserRole = "ADMIN" | "CONSULTANT" | "CONSULTING_FIR_ADMIN" | "EMPLOYEE" | string;

// Define the store state
interface AuthState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setOrganizations: (organizations: Organization[]) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
  clearAuth: () => void;
}

// Create the store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      organizations: [],
      selectedOrganization: null,
      setOrganizations: (organizations) => set((state) => ({ 
        organizations,
        // If there's at least one organization and no selected organization, select the first one
        selectedOrganization: state.selectedOrganization || (organizations.length > 0 ? organizations[0] : null)
      })),
      setSelectedOrganization: (selectedOrganization) => set({ selectedOrganization }),
      clearAuth: () => {
        // Clear organization-related localStorage items
        localStorage.removeItem("selectedCompany");
        localStorage.removeItem("selectedCertificate");
        
        // Reset the state
        set({ 
          organizations: [], 
          selectedOrganization: null
        });
      },
    }),
    {
      name: "auth-storage", // name of the item in storage
      // Only persist these fields
      partialize: (state) => ({
        organizations: state.organizations,
        selectedOrganization: state.selectedOrganization,
      }),
    }
  )
);
