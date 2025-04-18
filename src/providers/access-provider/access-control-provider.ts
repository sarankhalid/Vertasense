"use client"

import { supabaseBrowserClient } from "@/utils/supabase/client";
import { AccessControlProvider, useGetIdentity, useList, useOne } from "@refinedev/core";
import { useAuthStore } from "@/store/useAuthStore";

// Example Access Control Provider
export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action, params }) => {

        // Get the authenticated user
        const { data: { user } } = await supabaseBrowserClient.auth.getUser();

        if (!user) {
            return {
                can: false,
                reason: "User is not authenticated",
            };
        }

        console.log("User : ", user)
        // Get the selected organization from the auth store
        const selectedOrganization = useAuthStore.getState().selectedOrganization;
        
        if (!selectedOrganization) {
            return {
                can: false,
                reason: "No organization selected",
            };
        }
        
        // Get the role from the selected organization
        const organizationRole = selectedOrganization.role;
        
        if (!organizationRole) {
            return {
                can: false,
                reason: "Selected organization does not have a role assigned",
            };
        }
        
        // Fetch role ID from the roles table based on the role name
        const { data: roleData, error: roleError } = await supabaseBrowserClient
            .from("roles")
            .select("id")
            .eq("name", organizationRole)
            .single();
            
        if (roleError) {
            return {
                can: false,
                reason: "Error fetching role ID",
            };
        }
        
        const roleId = roleData?.id;
        
        if (!roleId) {
            return {
                can: false,
                reason: "Role not found in the database",
            };
        }

        // Fetch the resource by its name from the `resources` table.
        const { data: resourceData, error: resourceError } = await supabaseBrowserClient
            .from("resources")
            .select("id")
            .eq("name", resource)
            .single();


        if (resourceError || !resourceData?.id) {
            return {
                can: false,
                reason: "Error fetching resource by name or resource does not exist",
            };
        }

        // Fetch permissions for the role and resource from the `role_resource_permissions` table
        const { data: permissions, error: permissionError } = await supabaseBrowserClient
            .from("role_resource_permissions")
            .select("permission_id")
            .eq("role_id", roleId)
            .eq("resource_id", resourceData.id);

        if (permissionError) {
            return {
                can: false,
                reason: "Error fetching role permissions",
            };
        }

        // If no permissions returned, deny access
        if (permissions.length === 0) {
            return {
                can: false,
                reason: "No permissions for this role-resource pair",
            };
        }

        // Now check if any permission matches the action
        const permissionIds = permissions.map(permission => permission.permission_id);

        // Fetch the corresponding permission name based on the permission IDs
        const { data: permissionNames, error: permissionNamesError } = await supabaseBrowserClient
            .from("permissions")
            .select("name")
            .in("id", permissionIds);

        if (permissionNamesError) {
            return {
                can: false,
                reason: "Error fetching permission names",
            };
        }

        // Check if the action exists in the permissions
        const hasPermission = permissionNames.some(permission => permission.name === action);

        if (hasPermission) {
            return { can: true };
        } else {
            return {
                can: false,
                reason: "Unauthorized",
            };
        }

    },
};
