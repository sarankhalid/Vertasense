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
      setOrganizations: (organizations) => {
        // Try to restore the selected organization from localStorage first
        let restoredOrg = null;
        try {
          const savedOrg = localStorage.getItem("selectedOrganization");
          if (savedOrg) {
            const parsedOrg = JSON.parse(savedOrg);
            // Find the organization in the new organizations list to ensure it's valid
            restoredOrg = organizations.find(org => org.id === parsedOrg.id) || null;
            console.log("useAuthStore: Restored organization from localStorage:", restoredOrg?.name || "not found");
          }
        } catch (error) {
          console.error("Error restoring organization from localStorage:", error);
        }
        
        set((state) => ({ 
          organizations,
          // Priority: 1. Current selection if valid, 2. Restored from localStorage if valid, 3. First organization
          selectedOrganization: 
            (state.selectedOrganization && organizations.some(org => org.id === state.selectedOrganization?.id)) 
              ? state.selectedOrganization 
              : restoredOrg || (organizations.length > 0 ? organizations[0] : null)
        }));
      },
      setSelectedOrganization: (selectedOrganization) => {
        // Save to localStorage explicitly
        if (selectedOrganization) {
          localStorage.setItem("selectedOrganization", JSON.stringify(selectedOrganization));
        } else {
          localStorage.removeItem("selectedOrganization");
        }
        
        set({ selectedOrganization });
      },
      clearAuth: () => {
        // Clear organization-related localStorage items
        localStorage.removeItem("selectedOrganization");
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
