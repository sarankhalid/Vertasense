"use client";

import { dataProvider } from "@/providers/data-provider";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { liveProvider } from "@/providers/live-provider";
// Client-side only implementation

export interface Company {
  id: string;
  name: string;
  logo?: string;
  type?: string; // llc, corporation, partnership, sole-proprietorship
  industry?: string; // technology, healthcare, finance, manufacturing, retail
  created_at?: string;
  updated_at?: string;
}

export const companyProvider = {
  // Get companies related to a specific organization with type "COMPANY"
  getRelatedCompanies: async (organizationId: string) => {
    // Get companies related to the specified organization where type is "COMPANY"
    const { data: orgRelations, error: orgRelationsError } = await supabaseBrowserClient
      .from("org_relations")
      .select("org_2")
      .eq("org_1", organizationId);

    if (orgRelationsError) {
      console.error("Error fetching org relations:", orgRelationsError);
      return;
    }

    // Extract org_2 values (i.e., company IDs)
    const orgIds = orgRelations.map((relation) => relation.org_2);

    // Now fetch organizations whose IDs are in the orgIds array
    const { data: organizations, error: organizationsError } = await supabaseBrowserClient
      .from("organizations")
      .select("*")
      .in("id", orgIds);

    if (organizationsError) {
      console.error("Error fetching organizations:", organizationsError);
      return;
    }

    // Format the data to match the Company interface
    // const formattedCompanies = organizations.map((item: any) => ({
    //   id: item.id,
    //   name: item.name,
    //   type: item.type,
    //   address: item.address,
    //   description: item.description,
    //   is_active: item.is_active,
    //   created_at: item.created_at,
    //   updated_at: item.updated_at,
    // }));

    // console.log("Formatted Companies : ", formattedCompanies)

    return { data: organizations, error: null };
  },

  // Get all companies the user has access to
  getCompanies: async () => {
    // Get user's role and ID
    const { data: userData } = await supabaseBrowserClient.auth.getUser();

    if (!userData.user) {
      return { data: [], error: "User not authenticated" };
    }

    // Get user's role
    const { data: profileData } = await supabaseBrowserClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    let companiesQuery;

    if (profileData?.role === "admin") {
      // Admins can see all companies
      companiesQuery = supabaseBrowserClient.from("companies").select("*");
    } else {
      // Regular users can only see companies they have access to
      companiesQuery = supabaseBrowserClient
        .from("user_companies")
        .select("companies(*)")
        .eq("user_id", userData.user.id);
    }

    const { data, error } = await companiesQuery;

    if (error) {
      return { data: [], error: error.message };
    }

    // Format the data based on the query structure
    let formattedCompanies;
    if (profileData?.role === "admin") {
      formattedCompanies = data;
    } else {
      formattedCompanies = data.map((item: any) => item.companies);
    }

    return { data: formattedCompanies, error: null };
  },

  // Get a single company by ID
  getCompany: async (id: string) => {
    const { data, error } = await supabaseBrowserClient
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Create a new company
  createCompany: async (companyData: Omit<Company, "id" | "created_at" | "updated_at">) => {
    const { data: userData } = await supabaseBrowserClient.auth.getUser();

    if (!userData.user) {
      return { data: null, error: "User not authenticated" };
    }

    // Insert the company
    const { data: newCompany, error: companyError } = await supabaseBrowserClient
      .from("organizations")
      .insert([{ ...companyData, type: "COMPANY" }])
      .select()
      .single();

    if (companyError) {
      return { data: null, error: companyError.message };
    }

    // Associate the company with the user
    const { error: userCompanyError } = await supabaseBrowserClient
      .from("org_relations")
      .insert([
        {
          org_1: userData.user.user_metadata.organizationId,
          org_2: newCompany.id,
          relation: "linked_to",
        },
      ]);

    if (userCompanyError) {
      // If there's an error associating the user with the company,
      // we should ideally delete the company, but for simplicity, we'll just return the error
      return { data: null, error: userCompanyError.message, };
    }

    return { data: newCompany, error: null };
  },

  // Update a company
  updateCompany: async (id: string, companyData: Partial<Omit<Company, "id" | "created_at" | "updated_at">>) => {
    const { data, error } = await supabaseBrowserClient
      .from("companies")
      .update(companyData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Delete a company
  deleteCompany: async (id: string) => {
    // First, delete all user-company associations
    const { error: userCompanyError } = await supabaseBrowserClient
      .from("user_companies")
      .delete()
      .eq("company_id", id);

    if (userCompanyError) {
      return { success: false, error: userCompanyError.message };
    }

    // Then delete the company
    const { error } = await supabaseBrowserClient
      .from("companies")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  // Add a user to a company
  addUserToCompany: async (companyId: string, userEmail: string, role: string = "member") => {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabaseBrowserClient
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError) {
      return { success: false, error: "User not found" };
    }

    // Then add the user to the company
    const { error } = await supabaseBrowserClient
      .from("user_companies")
      .insert([
        {
          user_id: userData.id,
          company_id: companyId,
          role,
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  // Remove a user from a company
  removeUserFromCompany: async (companyId: string, userId: string) => {
    const { error } = await supabaseBrowserClient
      .from("user_companies")
      .delete()
      .eq("company_id", companyId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  // Get all users in a company
  getCompanyUsers: async (companyId: string) => {
    const { data, error } = await supabaseBrowserClient
      .from("user_companies")
      .select(`
        user_id,
        role,
        profiles:user_id (
          id,
          email,
          name
        )
      `)
      .eq("company_id", companyId);

    if (error) {
      return { data: [], error: error.message };
    }

    // Format the data to be more usable
    const formattedData = data.map((item) => ({
      id: item.user_id,
      role: item.role,
      ...item.profiles,
    }));

    return { data: formattedData, error: null };
  },
};

// No server-side implementation to avoid issues with next/headers

import { CrudFilters, CrudSorting, CrudFilter } from "@refinedev/core";

// Types for Refine data provider
interface GetListParams {
  resource: string;
  pagination?: {
    current?: number;
    pageSize?: number;
  };
  filters?: CrudFilters;
  sorters?: CrudSorting;
  meta?: Record<string, any>;
}

interface GetOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, any>;
}

interface CreateParams {
  resource: string;
  variables: Record<string, any>;
  meta?: Record<string, any>;
}

interface UpdateParams {
  resource: string;
  id: string | number;
  variables: Record<string, any>;
  meta?: Record<string, any>;
}

interface DeleteOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, any>;
}

// Refine data provider for companies
export const companyDataProvider = {
  ...dataProvider,

  // Custom method to get companies related to a specific organization
  getRelatedCompanies: async (organizationId: string) => {
    const result = await companyProvider.getRelatedCompanies(organizationId);

    if (!result) {
      return {
        data: [],
        total: 0,
      };
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      data: result.data,
      total: result.data.length,
    };
  },

  // Override the getList method to use our custom getCompanies method
  getList: async ({ resource, pagination, filters, sorters, meta }: GetListParams) => {
    if (resource === "companies") {
      const { data, error } = await companyProvider.getCompanies();

      if (error) {
        throw new Error(error);
      }

      return {
        data,
        total: data.length,
      };
    }

    // For other resources, use the default data provider
    return dataProvider.getList({ resource, pagination, filters, sorters, meta });
  },

  // Override the getOne method to use our custom getCompany method
  getOne: async ({ resource, id, meta }: GetOneParams) => {
    if (resource === "companies") {
      const { data, error } = await companyProvider.getCompany(id as string);

      if (error) {
        throw new Error(error);
      }

      return {
        data,
      };
    }

    // For other resources, use the default data provider
    return dataProvider.getOne({ resource, id, meta });
  },

  // Override the create method to use our custom createCompany method
  create: async ({ resource, variables, meta }: CreateParams) => {
    if (resource === "companies") {
      const { data, error } = await companyProvider.createCompany(variables as Omit<Company, "id" | "created_at" | "updated_at">);

      if (error) {
        throw new Error(error);
      }

      return {
        data,
      };
    }

    // For other resources, use the default data provider
    return dataProvider.create({ resource, variables, meta });
  },

  // Override the update method to use our custom updateCompany method
  update: async ({ resource, id, variables, meta }: UpdateParams) => {
    if (resource === "companies") {
      const { data, error } = await companyProvider.updateCompany(
        id as string,
        variables as Partial<Omit<Company, "id" | "created_at" | "updated_at">>
      );

      if (error) {
        throw new Error(error);
      }

      return {
        data,
      };
    }

    // For other resources, use the default data provider
    return dataProvider.update({ resource, id, variables, meta });
  },

  // Override the deleteOne method to use our custom deleteCompany method
  deleteOne: async ({ resource, id, meta }: DeleteOneParams) => {
    if (resource === "companies") {
      const { success, error } = await companyProvider.deleteCompany(id as string);

      if (!success) {
        throw new Error(error || "Failed to delete company");
      }

      return {
        data: { id },
      };
    }

    // For other resources, use the default data provider
    return dataProvider.deleteOne({ resource, id, meta });
  },
};
