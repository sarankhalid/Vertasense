"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export function OrganizationLoader() {
  const { organizations, setOrganizations, selectedOrganization, setSelectedOrganization } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOrganizations = async () => {
      // Skip if organizations are already loaded
      if (organizations.length > 0) {
        return;
      }

      setLoading(true);
      try {
        // Fetch user data
        const { data: userData } = await supabaseBrowserClient.auth.getUser();

        if (!userData?.user) {
          console.error("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch consultant role ID to exclude it from the query
        const { data: consultantRoleData } = await supabaseBrowserClient
          .from("roles")
          .select("id")
          .eq("name", "CONSULTANT")
          .single();

        // Fetch user's organizations and role from org_users table
        const { data: orgUserData, error: orgUserError } =
          await supabaseBrowserClient
            .from("org_users")
            .select(
              `
              id,
              organization_id,
              role_id,
              organizations:organization_id (
                id,
                name,
                type
              ),
              roles:role_id (
                id,
                name
              )
            `
            )
            .eq("user_id", userData.user.id)
            .neq("role_id", consultantRoleData?.id);

        if (orgUserError) {
          console.error("Error fetching user organization/role:", orgUserError);
        } else if (orgUserData && orgUserData.length > 0) {
          // Extract organizations from the data with their associated roles
          const orgs = orgUserData
            .filter((item: any) => item.organizations && item.roles)
            .map((item: any) => ({
              id: item.organizations.id,
              name: item.organizations.name,
              type: item.organizations.type,
              role: item.roles?.name,
            }));

          // Store organizations in global state
          if (orgs.length > 0) {
            setOrganizations(orgs);

            // If there's no selected organization, set the first one
            if (!selectedOrganization && orgs.length > 0) {
              setSelectedOrganization(orgs[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [organizations.length, selectedOrganization, setOrganizations, setSelectedOrganization]);

  // This component doesn't render anything visible
  return null;
}
