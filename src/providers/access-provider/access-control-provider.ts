"use client"

import { supabaseBrowserClient } from "@/utils/supabase/client";
import { AccessControlProvider, useGetIdentity, useList, useOne } from "@refinedev/core";

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
        // Fetch user's role from the `org_users` table
        const { data: roleData, error: roleError } = await supabaseBrowserClient
            .from("org_users")
            .select("role_id")
            .eq("user_id", user.id)
            .single();

        console.log("Org Users : ", roleData)


        if (roleError) {
            return {
                can: false,
                reason: "Error fetching user role",
            };
        }

        const roleId = roleData?.role_id;

        if (!roleId) {
            return {
                can: false,
                reason: "User does not have a role assigned",
            };
        }

        // Fetch the resource by its name from the `resources` table.
        const { data: resourceData, error: resourceError } = await supabaseBrowserClient
            .from("resources")
            .select("id")
            .eq("name", resource)
            .single();

        console.log("Resource Data : ", resourceData);

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
