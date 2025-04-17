"use client";

import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import { useAuthStore } from "@/store/useAuthStore";

export function SelectionPersistence() {
  const { 
    companies, 
    selectedCompany, 
    setSelectedCompany 
  } = useCompanyStore();
  
  const { 
    certificates, 
    selectedCertificate, 
    setSelectedCertificate 
  } = useCertificateStore();
  
  const { selectedOrganization } = useAuthStore();

  // Track the current organization and company IDs to detect changes
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);
  const [lastCompanyId, setLastCompanyId] = useState<string | null>(null);
  
  // When organization changes, update the lastOrgId
  useEffect(() => {
    if (selectedOrganization && selectedOrganization.id !== lastOrgId) {
      setLastOrgId(selectedOrganization.id);
      // When organization changes, we don't reset the selected company
      // The CompanySelector will handle fetching the companies for the new organization
    }
  }, [selectedOrganization, lastOrgId]);
  
  // When company changes, update the lastCompanyId
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== lastCompanyId) {
      setLastCompanyId(selectedCompany.id);
      // When company changes, we need to ensure certificates are fetched
      // This is handled by the CertificateSelector component
    }
  }, [selectedCompany, lastCompanyId]);
  
  // Restore selected company from localStorage when companies are loaded
  useEffect(() => {
    if (companies.length > 0) {
      try {
        // Check if the current selected company is valid for the current companies list
        const isCurrentCompanyValid = selectedCompany && 
          companies.some(c => c.id === selectedCompany.id);
        
        // If the current selected company is not valid, try to restore from localStorage
        if (!isCurrentCompanyValid) {
          const savedCompany = localStorage.getItem("selectedCompany");
          if (savedCompany) {
            const parsedCompany = JSON.parse(savedCompany);
            // Find the company in the current companies list to ensure it's valid
            const foundCompany = companies.find(c => c.id === parsedCompany.id);
            if (foundCompany) {
              setSelectedCompany(foundCompany);
            } else {
              // If the saved company is not in the current list, select the first one
              setSelectedCompany(companies[0]);
            }
          } else if (companies.length > 0) {
            // If no saved company, select the first one
            setSelectedCompany(companies[0]);
          }
        }
      } catch (error) {
        console.error("Error restoring selected company:", error);
        // In case of error, select the first company
        if (companies.length > 0) {
          setSelectedCompany(companies[0]);
        }
      }
    }
  }, [companies, selectedCompany, setSelectedCompany]);

  // Restore selected certificate from localStorage when certificates are loaded
  useEffect(() => {
    // If there are no certificates, make sure to reset the selected certificate
    if (certificates.length === 0 && selectedCertificate !== null) {
      console.log("No certificates available, resetting selected certificate");
      setSelectedCertificate(null);
      return;
    }
    
    if (certificates.length > 0) {
      try {
        // Check if the current selected certificate is valid for the current certificates list
        const isCurrentCertificateValid = selectedCertificate && 
          certificates.some(c => c.id === selectedCertificate.id);
        
        // If the current selected certificate is not valid, try to restore from localStorage
        if (!isCurrentCertificateValid) {
          const savedCertificate = localStorage.getItem("selectedCertificate");
          if (savedCertificate) {
            const parsedCertificate = JSON.parse(savedCertificate);
            
            // Find the certificate in the current certificates list to ensure it's valid
            const foundCertificate = certificates.find(c => c.id === parsedCertificate.id);
            
            // Only restore the certificate if it belongs to the current company
            if (foundCertificate && selectedCompany) {
              // Since we found the certificate in the current certificates list,
              // which is already filtered by company, we can safely set it as selected
              setSelectedCertificate(foundCertificate);
            } else {
              // If the saved certificate is not in the current list, select the first one
              if (certificates.length > 0) {
                setSelectedCertificate(certificates[0]);
              } else {
                setSelectedCertificate(null);
              }
            }
          } else if (certificates.length > 0) {
            // If no saved certificate, select the first one
            setSelectedCertificate(certificates[0]);
          }
        }
      } catch (error) {
        console.error("Error restoring selected certificate:", error);
        // In case of error, select the first certificate
        if (certificates.length > 0) {
          setSelectedCertificate(certificates[0]);
        } else {
          setSelectedCertificate(null);
        }
      }
    }
  }, [certificates, selectedCertificate, setSelectedCertificate, selectedCompany]);

  // Save selected company to localStorage when it changes
  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
    }
  }, [selectedCompany]);

  // Save selected certificate to localStorage when it changes
  useEffect(() => {
    if (selectedCertificate) {
      localStorage.setItem("selectedCertificate", JSON.stringify(selectedCertificate));
    }
  }, [selectedCertificate]);

  // This component doesn't render anything visible
  return null;
}
