"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companyProvider, Company } from "@/providers/company-provider";
import { useCreate } from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useAuthStore } from "./useAuthStore";

interface CompanyState {
  // Data
  companies: Company[];
  selectedCompany: Company | null;
  loadingCompanies: boolean;

  // Actions
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setLoadingCompanies: (loading: boolean) => void;

  // API methods
  fetchCompanies: (organizationId: string) => Promise<void>;
  // createCompany: (companyData: Omit<Company, "id" | "created_at" | "updated_at">) => Promise<{ data: Company | null; error: string | null }>;
  createCompany: (companyData: Omit<Company, "id" | "created_at" | "updated_at">) => void;
  updateCompany: (id: string, companyData: Partial<Omit<Company, "id" | "created_at" | "updated_at">>) => Promise<{ data: Company | null; error: string | null }>;
  deleteCompany: (id: string) => Promise<{ success: boolean; error: string | null }>;

  // Reset
  clearCompanies: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      // Initial state
      companies: [],
      selectedCompany: null,
      loadingCompanies: false,

      // Actions
      setCompanies: (companies) => set({ companies }),
      setSelectedCompany: (company) => {
        set({ selectedCompany: company });
        if (company) {
          localStorage.setItem("selectedCompany", JSON.stringify(company));
        } else {
          localStorage.removeItem("selectedCompany");
        }
      },
      setLoadingCompanies: (loading) => set({ loadingCompanies: loading }),

      // API methods
      fetchCompanies: async (organizationId) => {
        const { setLoadingCompanies, setCompanies, setSelectedCompany } = get();

        setLoadingCompanies(true);
        try {
          const result = await companyProvider.getRelatedCompanies(organizationId);

          if (!result) {
            setCompanies([]);
            return;
          }

          if (result.error) {
            console.error("Error fetching companies:", result.error);
            setCompanies([]);
          } else {
            setCompanies(result.data);

            // Set the first company as selected if available and no company is currently selected
            const { selectedCompany } = get();
            if (result.data.length > 0 && !selectedCompany) {
              setSelectedCompany(result.data[0]);
            }
          }
        } catch (err) {
          console.error("Failed to fetch companies:", err);
          setCompanies([]);
        } finally {
          setLoadingCompanies(false);
        }
      },

      // createCompany: async (companyData) => {
      //   // Insert the company
      //   const { data: newCompany, error: companyError } = await supabaseBrowserClient
      //     .from("organizations")
      //     .insert([{ ...companyData, type: "COMPANY" }])
      //     .select()
      //     .single();

      //   if (companyError) {
      //     return { data: null, error: companyError.message };
      //   }



      //   // Associate the company with the user
      //   const { error: userCompanyError } = await supabaseBrowserClient
      //     .from("org_relations")
      //     .insert([
      //       {
      //         org_1: useAuthStore.getState().selectedOrganization?.id,
      //         org_2: newCompany.id,
      //         relation: "linked_to",
      //       },
      //     ]);

      //   if (userCompanyError) {
      //     // If there's an error associating the user with the company,
      //     // we should ideally delete the company, but for simplicity, we'll just return the error
      //     return { data: null, error: userCompanyError.message, };
      //   }

      //   // if (result.data) {
      //   //   // Update the companies list with the new company
      //   //   const { companies } = get();
      //   //   set({ companies: [...companies, result.data] });

      //   //   // Set the new company as selected
      //   //   get().setSelectedCompany(result.data);
      //   // }

      //   // return result;
      // },

      createCompany: async (companyData) => {
        try {
          // Insert the company
          const result = await supabaseBrowserClient
            .from("organizations")
            .insert([{ ...companyData, type: "COMPANY" }])
            .select()
            .single();

          if (!result) {
            return { data: null, error: "No response from Supabase" };
          }

          const { data: newCompany, error: companyError } = result;

          if (companyError) {
            return { data: null, error: companyError.message };
          }

          // Associate the company with the user
          const { error: userCompanyError } = await supabaseBrowserClient
            .from("org_relations")
            .insert([
              {
                org_1: useAuthStore.getState().selectedOrganization?.id,
                org_2: newCompany.id,
                relation: "linked_to",
              },
            ]);

          if (userCompanyError) {
            // Optionally, you might consider rolling back the inserted company here.
            return { data: null, error: userCompanyError.message };
          }

          // Optionally update the companies list if needed:
          const { companies } = get();
          set({ companies: [...companies, newCompany] });
          get().setSelectedCompany(newCompany);

          return { data: newCompany, error: null };
        } catch (error: any) {
          console.error("Failed to create company:", error);
          return { data: null, error: error.message || "Unknown error" };
        }
      },


      updateCompany: async (id, companyData) => {
        const result = await companyProvider.updateCompany(id, companyData);

        if (result.data) {
          // Update the companies list with the updated company
          const { companies, selectedCompany } = get();
          const updatedCompanies = companies.map(company =>
            company.id === id ? result.data! : company
          );

          set({ companies: updatedCompanies });

          // Update selected company if it's the one being updated
          if (selectedCompany && selectedCompany.id === id) {
            get().setSelectedCompany(result.data);
          }
        }

        return result;
      },

      deleteCompany: async (id) => {
        const result = await companyProvider.deleteCompany(id);

        if (result.success) {
          // Remove the company from the companies list
          const { companies, selectedCompany } = get();
          const updatedCompanies = companies.filter(company => company.id !== id);

          set({ companies: updatedCompanies });

          // If the deleted company was selected, select another company if available
          if (selectedCompany && selectedCompany.id === id) {
            if (updatedCompanies.length > 0) {
              get().setSelectedCompany(updatedCompanies[0]);
            } else {
              get().setSelectedCompany(null);
            }
          }
        }

        return result;
      },

      // Reset
      clearCompanies: () => {
        set({
          companies: [],
          selectedCompany: null,
          loadingCompanies: false
        });
        localStorage.removeItem("selectedCompany");
      },
    }),
    {
      name: "company-storage",
      partialize: (state) => ({
        selectedCompany: state.selectedCompany,
      }),
    }
  )
);
