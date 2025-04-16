"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { certificateProvider, Certificate } from "@/providers/certificate-provider";
import { Certification } from "@/types/certification";

// Define the structure of the certificate data returned from the API
interface ClientCertificate extends Omit<Certificate, 'name' | 'standard'> {
  certifications: Certification;
}

interface CertificateState {
  // Data
  certificates: ClientCertificate[];
  certifications: Certification[];
  selectedCertificate: ClientCertificate | null;
  selectedCertification: Certification | null;
  loadingCertificates: boolean;
  loadingCertifications: boolean;
  
  // Actions
  setCertificates: (certificates: ClientCertificate[]) => void;
  setCertifications: (certifications: Certification[]) => void;
  setSelectedCertificate: (certificate: ClientCertificate | null) => void;
  setSelectedCertification: (certification: Certification | null) => void;
  setLoadingCertificates: (loading: boolean) => void;
  setLoadingCertifications: (loading: boolean) => void;
  
  // API methods
  fetchCertificates: (companyId: string) => Promise<void>;
  fetchAllCertifications: () => Promise<void>;
  createCertificate: (certificateData: Omit<Certificate, "id" | "created_at" | "updated_at">) => Promise<{ data: Certificate | null; error: string | null }>;
  updateCertificate: (id: string, certificateData: Partial<Omit<Certificate, "id" | "created_at" | "updated_at">>) => Promise<{ data: Certificate | null; error: string | null }>;
  deleteCertificate: (id: string) => Promise<{ success: boolean; error: string | null }>;
  
  // Reset
  clearCertificates: () => void;
}

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      // Initial state
      certificates: [],
      certifications: [],
      selectedCertificate: null,
      selectedCertification: null,
      loadingCertificates: false,
      loadingCertifications: false,
      
      // Actions
      setCertificates: (certificates) => set({ certificates }),
      setCertifications: (certifications) => set({ certifications }),
      setSelectedCertificate: (certificate) => set({ selectedCertificate: certificate }),
      setSelectedCertification: (certification) => set({ selectedCertification: certification }),
      setLoadingCertificates: (loading) => set({ loadingCertificates: loading }),
      setLoadingCertifications: (loading) => set({ loadingCertifications: loading }),
      
      // API methods
      fetchCertificates: async (companyId) => {
        if (!companyId) {
          set({ certificates: [], loadingCertificates: false });
          return;
        }
        
        set({ loadingCertificates: true });
        try {
          const { data, error } = await certificateProvider.getCertificates(companyId);
          
          if (error) {
            console.error("Error fetching certificates:", error);
            set({ certificates: [] });
          } else {
            set({ certificates: data });
            
            // Set the first certificate as selected if available and no certificate is currently selected
            const { selectedCertificate } = get();
            if (data.length > 0 && !selectedCertificate) {
              set({ selectedCertificate: data[0] });
            }
          }
        } catch (err) {
          console.error("Failed to fetch certificates:", err);
          set({ certificates: [] });
        } finally {
          set({ loadingCertificates: false });
        }
      },
      
      fetchAllCertifications: async () => {
        set({ loadingCertifications: true });
        try {
          const { data, error } = await certificateProvider.getAllCertifications();
          
          if (error) {
            console.error("Error fetching certifications:", error);
            set({ certifications: [] });
          } else {
            set({ certifications: data || [] });
          }
        } catch (err) {
          console.error("Failed to fetch certifications:", err);
          set({ certifications: [] });
        } finally {
          set({ loadingCertifications: false });
        }
      },
      
      createCertificate: async (certificateData) => {
        const result = await certificateProvider.createCertificate(certificateData);
        
        if (result.data) {
          // Update the certificates list with the new certificate
          const { certificates } = get();
          set({ 
            certificates: [...certificates, result.data],
            selectedCertificate: result.data
          });
        }
        
        return result;
      },
      
      updateCertificate: async (id, certificateData) => {
        const result = await certificateProvider.updateCertificate(id, certificateData);
        
        if (result.data) {
          // Update the certificates list with the updated certificate
          const { certificates, selectedCertificate } = get();
          const updatedCertificates = certificates.map(certificate => 
            certificate.id === id ? result.data! : certificate
          );
          
          set({ certificates: updatedCertificates });
          
          // Update selected certificate if it's the one being updated
          if (selectedCertificate && selectedCertificate.id === id) {
            set({ selectedCertificate: result.data });
          }
        }
        
        return result;
      },
      
      deleteCertificate: async (id) => {
        const result = await certificateProvider.deleteCertificate(id);
        
        if (result.success) {
          // Remove the certificate from the certificates list
          const { certificates, selectedCertificate } = get();
          const updatedCertificates = certificates.filter(certificate => certificate.id !== id);
          
          set({ certificates: updatedCertificates });
          
          // If the deleted certificate was selected, select another certificate if available
          if (selectedCertificate && selectedCertificate.id === id) {
            if (updatedCertificates.length > 0) {
              set({ selectedCertificate: updatedCertificates[0] });
            } else {
              set({ selectedCertificate: null });
            }
          }
        }
        
        return result;
      },
      
      // Reset
      clearCertificates: () => {
        set({ 
          certificates: [],
          selectedCertificate: null,
          loadingCertificates: false
        });
      },
    }),
    {
      name: "certificate-storage",
      partialize: (state) => ({
        selectedCertificate: state.selectedCertificate,
        selectedCertification: state.selectedCertification,
      }),
    }
  )
);
