"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export function OrganizationLoader() {
  const {
    organizations,
    setOrganizations,
    selectedOrganization,
    setSelectedOrganization,
  } = useAuthStore();
  const [loading, setLoading] = useState(false);

  console.log("Organizations : ", organizations);

  // First effect: Try to restore organization from localStorage immediately
  useEffect(() => {
    // Only try to restore if there's no selected organization
    if (!selectedOrganization) {
      try {
        const savedOrg = localStorage.getItem("selectedOrganization");
        if (savedOrg) {
          const parsedOrg = JSON.parse(savedOrg);
          console.log("OrganizationLoader: Immediately restoring organization from localStorage:", parsedOrg.name);
          setSelectedOrganization(parsedOrg);
        }
      } catch (error) {
        console.error("Error restoring organization from localStorage:", error);
      }
    }
  }, [selectedOrganization, setSelectedOrganization]);

  // Second effect: Load organizations from the server
  useEffect(() => {
    const loadOrganizations = async () => {
      
      // Skip if organizations are already loaded
      if (organizations.length > 0) {
        console.log("Organizations already loaded, skipping fetch");
        return;
      }

      console.log("Loading organizations...");
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

        console.log("Organizations Inside : ", orgUserData);

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
            console.log("Setting organizations:", orgs.length);
            setOrganizations(orgs);

            // If there's no selected organization, set the first one
            if (!selectedOrganization && orgs.length > 0) {
              console.log("No selected organization, setting first one:", orgs[0].name);
              // setSelectedOrganization(orgs[0]);
            } else if (selectedOrganization) {
              // If there is a selected organization (from persisted state), make sure it exists in the fetched list
              const orgExists = orgs.some(org => org.id === selectedOrganization.id);
              if (!orgExists && orgs.length > 0) {
                console.log("Selected organization not found in fetched list, setting first one");
                // setSelectedOrganization(orgs[0]);
              } else {
                console.log("Selected organization exists in fetched list, keeping it");
              }
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
  }, [
    organizations.length,
    selectedOrganization,
    setOrganizations,
    setSelectedOrganization,
  ]);

  // This component doesn't render anything visible
  return null;
}
