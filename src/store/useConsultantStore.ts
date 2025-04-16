"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";
import { supabaseBrowserClient } from "@/utils/supabase/client";

// Define the structure of a consultant
interface Consultant {
  id: string;
  user_id: string;
  organization_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
  };
  role?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

// Define the structure of a user certification
interface UserCertification {
  id: string;
  user_id: string;
  client_certification_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ConsultantState {
  // Data
  consultants: Consultant[];
  selectedConsultant: Consultant | null;
  loadingConsultants: boolean;

  // Actions
  setConsultants: (consultants: Consultant[]) => void;
  setSelectedConsultant: (consultant: Consultant | null) => void;
  setLoadingConsultants: (loading: boolean) => void;

  // API methods
  fetchConsultants: (organizationId: string) => Promise<void>;
  createConsultant: (consultantData: { name: string; email: string; phone: string; organization_id: string }) => Promise<{ data: any | null; error: string | null }>;
  updateConsultant: (userId: string, consultantData: { name?: string; email?: string; phone?: string }) => Promise<{ data: any | null; error: string | null }>;
  deleteConsultant: (userId: string, orgUserId: string) => Promise<{ success: boolean; error: string | null }>;

  // Certification methods
  assignCertification: (userId: string, clientCertificationId: string, status?: string, notes?: string) => Promise<{ data: UserCertification | null; error: string | null }>;
  assignCompanyandCertificationsToConsultant: (consultantId: string, companyId: string, certificateIds: string[]) => Promise<{ success: boolean; error: string | null }>;
  // Reset
  clearConsultants: () => void;
}

export const useConsultantStore = create<ConsultantState>()(
  persist(
    (set, get) => ({
      // Initial state
      consultants: [],
      selectedConsultant: null,
      loadingConsultants: false,

      // Actions
      setConsultants: (consultants) => set({ consultants }),
      setSelectedConsultant: (consultant) => set({ selectedConsultant: consultant }),
      setLoadingConsultants: (loading) => set({ loadingConsultants: loading }),

      // API methods
      fetchConsultants: async (organizationId) => {
        if (!organizationId) {
          set({ consultants: [], loadingConsultants: false });
          return;
        }

        set({ loadingConsultants: true });
        try {
          // Create a Supabase client
          const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

          // Fetch consultants (org_users with role EMPLOYEE)
          const { data, error } = await supabase
            .from('org_users')
            .select('*, user:user_id(*), role:role_id(*)')
            .eq('organization_id', organizationId)
            .eq('role.name', 'EMPLOYEE');

          if (error) {
            console.error("Error fetching consultants:", error);
            set({ consultants: [] });
          } else {
            set({ consultants: data || [] });

            // Set the first consultant as selected if available and no consultant is currently selected
            const { selectedConsultant } = get();
            if (data && data.length > 0 && !selectedConsultant) {
              set({ selectedConsultant: data[0] });
            }
          }
        } catch (err) {
          console.error("Failed to fetch consultants:", err);
          set({ consultants: [] });
        } finally {
          set({ loadingConsultants: false });
        }
      },

      createConsultant: async (consultantData) => {
        try {
          // Create a user via the API
          const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...consultantData,
              role: 'EMPLOYEE',
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            return { data: null, error: result.message || 'Failed to create consultant' };
          }

          // Refresh the consultants list
          await get().fetchConsultants(consultantData.organization_id);

          return { data: result, error: null };
        } catch (err) {
          console.error("Error creating consultant:", err);
          return { data: null, error: err instanceof Error ? err.message : 'An unknown error occurred' };
        }
      },

      updateConsultant: async (userId, consultantData) => {
        try {
          // Create a Supabase client
          const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

          // Update the user
          const { data, error } = await supabase
            .from('users')
            .update(consultantData)
            .eq('id', userId)
            .select();

          if (error) {
            return { data: null, error: error.message };
          }

          // Update the local state
          const { consultants, selectedConsultant } = get();
          const updatedConsultants = consultants.map(consultant => {
            if (consultant.user_id === userId) {
              return {
                ...consultant,
                user: {
                  ...consultant.user,
                  ...consultantData
                }
              };
            }
            return consultant;
          });

          set({ consultants: updatedConsultants });

          // Update selected consultant if it's the one being updated
          if (selectedConsultant && selectedConsultant.user_id === userId) {
            set({
              selectedConsultant: {
                ...selectedConsultant,
                user: {
                  ...selectedConsultant.user,
                  ...consultantData
                }
              }
            });
          }

          return { data, error: null };
        } catch (err) {
          console.error("Error updating consultant:", err);
          return { data: null, error: err instanceof Error ? err.message : 'An unknown error occurred' };
        }
      },

      deleteConsultant: async (userId, orgUserId) => {
        try {
          // Create a Supabase client
          const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

          // First delete the org_user record
          const { error: orgUserError } = await supabase
            .from('org_users')
            .delete()
            .eq('id', orgUserId);

          if (orgUserError) {
            return { success: false, error: orgUserError.message };
          }

          // Then delete the user
          const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (userError) {
            return { success: false, error: userError.message };
          }

          // Update the local state
          const { consultants, selectedConsultant } = get();
          const updatedConsultants = consultants.filter(consultant => consultant.user_id !== userId);

          set({ consultants: updatedConsultants });

          // If the deleted consultant was selected, select another consultant if available
          if (selectedConsultant && selectedConsultant.user_id === userId) {
            if (updatedConsultants.length > 0) {
              set({ selectedConsultant: updatedConsultants[0] });
            } else {
              set({ selectedConsultant: null });
            }
          }

          return { success: true, error: null };
        } catch (err) {
          console.error("Error deleting consultant:", err);
          return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
        }
      },

      assignCertification: async (userId, clientCertificationId, status = 'ASSIGNED', notes = '') => {
        try {
          // Create a user certification
          const { data, error } = await supabaseBrowserClient
            .from('user_certifications')
            .insert({
              user_id: userId,
              client_certification_id: clientCertificationId,
              status,
              notes
            })
            .select();

          if (error) {
            return { data: null, error: error.message };
          }

          return { data: data[0], error: null };
        } catch (err) {
          console.error("Error assigning certification:", err);
          return { data: null, error: err instanceof Error ? err.message : 'An unknown error occurred' };
        }
      },

      // Method for assigning a company to a consultant
      assignCompanyandCertificationsToConsultant: async (consultantId, companyId, certificateIds) => {
        try {

          console.log("Consultant Id : ", consultantId)
          
          // Add the company to the consultant's companies
          const { error: companyError } = await supabaseBrowserClient
            .from("org_users")
            .insert({
              user_id: consultantId,
              organization_id: companyId,
              role_id: "9a0467eb-3356-4317-9e9b-4661dbc34c60"
            });

          if (companyError) {
            return { success: false, error: companyError.message };
          }

          // Add the certifications for the consultant
          const { error: certError } = await supabaseBrowserClient
            .from("user_certifications")
            .insert(
              certificateIds.map((certId) => ({
                user_id: consultantId,
                client_certification_id: certId,
              }))
            );

          if (certError) {
            return { success: false, error: certError.message };
          }

          return { success: true, error: null };
        } catch (err) {
          console.error("Error assigning company and certifications:", err);
          return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
        }
      },

      // Reset
      clearConsultants: () => {
        set({
          consultants: [],
          selectedConsultant: null,
          loadingConsultants: false
        });
      },
    }),
    {
      name: "consultant-storage",
      partialize: (state) => ({
        selectedConsultant: state.selectedConsultant,
      }),
    }
  )
);
