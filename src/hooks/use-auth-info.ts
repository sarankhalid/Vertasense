"use client";

import { useAuthStore } from "@/store/useAuthStore";

/**
 * Custom hook to access organization and role information
 * This hook provides a convenient way to access the globally stored auth information
 */
export const useAuthInfo = () => {
  const { organizations, selectedOrganization } = useAuthStore();

  // Get the current role from the selected organization
  const currentRole = selectedOrganization?.role;

  return {
    organizations,
    organization: selectedOrganization, // For backward compatibility
    selectedOrganization,
    role: currentRole, // For backward compatibility
    currentRole,
    hasMultipleOrganizations: organizations.length > 1,
    isAdmin: currentRole === "ADMIN",
    isConsultant: currentRole === "CONSULTANT",
    isUser: currentRole === "USER",
    // Helper function to check if user has a specific role in the current organization
    hasRole: (roleName: string) => currentRole === roleName,
    // Helper function to get the role for a specific organization
    getRoleForOrganization: (organizationId: string) => {
      const org = organizations.find(org => org.id === organizationId);
      return org?.role;
    }
  };
};
