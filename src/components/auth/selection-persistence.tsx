"use client";

import { useEffect, useState, useRef } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import { useAuthStore } from "@/store/useAuthStore";

export function SelectionPersistence() {
  const { 
    companies, 
    selectedCompany, 
    setSelectedCompany,
    fetchCompanies,
    loadingCompanies
  } = useCompanyStore();
  
  const { 
    certificates, 
    selectedCertificate, 
    setSelectedCertificate,
    fetchCertificates,
    loadingCertificates
  } = useCertificateStore();
  
  const { 
    organizations,
    selectedOrganization, 
    setSelectedOrganization 
  } = useAuthStore();

  // Track if this is the initial page load
  const isInitialLoad = useRef(true);
  
  // Track the last organization and company IDs to detect changes
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);
  const [lastCompanyId, setLastCompanyId] = useState<string | null>(null);
  
  // Track if we've already fetched data for the current selections
  const fetchedForOrgRef = useRef<string | null>(null);
  const fetchedForCompanyRef = useRef<string | null>(null);
  
  // Restore organization from localStorage on initial load - more aggressive approach
  useEffect(() => {
    // Try to restore from localStorage first, regardless of whether there's a selected organization
    try {
      const savedOrg = localStorage.getItem("selectedOrganization");
      if (savedOrg) {
        const parsedOrg = JSON.parse(savedOrg);
        
        // If we have organizations loaded, validate against them
        if (organizations.length > 0) {
          // Find the organization in the current organizations list to ensure it's valid
          const foundOrg = organizations.find(org => org.id === parsedOrg.id);
          if (foundOrg) {
            console.log("SelectionPersistence: Restoring organization from localStorage:", foundOrg.name);
            // Only set if it's different from the current selection
            if (!selectedOrganization || selectedOrganization.id !== foundOrg.id) {
              setSelectedOrganization(foundOrg);
            }
          } else if (!selectedOrganization && organizations.length > 0) {
            // If the saved organization is not in the current list and no organization is selected, select the first one
            console.log("SelectionPersistence: Saved organization not found in list, selecting first organization");
            setSelectedOrganization(organizations[0]);
          }
        } else if (!selectedOrganization) {
          // If organizations aren't loaded yet, set the parsed org directly
          console.log("SelectionPersistence: Setting organization directly from localStorage:", parsedOrg.name);
          setSelectedOrganization(parsedOrg);
        }
      } else if (!selectedOrganization && organizations.length > 0) {
        // If no saved organization and no organization is selected, select the first one
        console.log("SelectionPersistence: No saved organization, selecting first organization");
        setSelectedOrganization(organizations[0]);
      }
    } catch (error) {
      console.error("Error restoring selected organization:", error);
      // In case of error, select the first organization if none is selected
      if (!selectedOrganization && organizations.length > 0) {
        setSelectedOrganization(organizations[0]);
      }
    }
  }, [organizations, selectedOrganization, setSelectedOrganization]);
  
  // Handle organization changes and fetch companies
  useEffect(() => {
    if (!selectedOrganization || loadingCompanies) return;
    
    const orgId = selectedOrganization.id;
    
    // Organization has changed
    if (orgId !== lastOrgId) {
      console.log("Organization changed to:", selectedOrganization.name);
      fetchedForOrgRef.current = orgId;
      
      // Only reset the selected company if this is not the initial load
      if (!isInitialLoad.current) {
        console.log("Not initial load, resetting selected company");
        setSelectedCompany(null);
        
        // Also reset the selected certificate when organization changes
        setSelectedCertificate(null);
      } else {
        console.log("Initial load, preserving selected company if valid");
      }
      
      // Fetch companies for the new organization
      fetchCompanies(orgId);
      setLastOrgId(orgId);
    }
    // If we haven't fetched for this organization yet and we're not loading
    else if (fetchedForOrgRef.current !== orgId && !loadingCompanies) {
      console.log("First time fetching companies for organization:", selectedOrganization.name);
      fetchedForOrgRef.current = orgId;
      fetchCompanies(orgId);
    }
  }, [selectedOrganization, fetchCompanies, setSelectedCompany, loadingCompanies, lastOrgId, setSelectedCertificate]);
  
  // Handle company changes and fetch certificates
  useEffect(() => {
    if (!selectedCompany || loadingCertificates) return;
    
    const companyId = selectedCompany.id;
    
    // Company has changed
    if (companyId !== lastCompanyId) {
      console.log("Company changed to:", selectedCompany.name);
      fetchedForCompanyRef.current = companyId;
      
      // Only reset the selected certificate if this is not the initial load
      if (!isInitialLoad.current) {
        console.log("Not initial load, resetting selected certificate");
        setSelectedCertificate(null);
      } else {
        console.log("Initial load, preserving selected certificate if valid");
      }
      
      // Fetch certificates for the new company
      fetchCertificates(companyId);
      setLastCompanyId(companyId);
    }
    // If we haven't fetched for this company yet and we're not loading
    else if (fetchedForCompanyRef.current !== companyId && !loadingCertificates) {
      console.log("First time fetching certificates for company:", selectedCompany.name);
      fetchedForCompanyRef.current = companyId;
      fetchCertificates(companyId);
    }
  }, [selectedCompany, fetchCertificates, setSelectedCertificate, loadingCertificates, lastCompanyId]);
  
  // Force fetch certificates when organization changes
  useEffect(() => {
    if (selectedCompany && selectedOrganization) {
      // When organization changes, we need to refetch certificates for the current company
      console.log("Organization changed, refetching certificates for current company");
      fetchCertificates(selectedCompany.id);
    }
  }, [selectedOrganization, selectedCompany, fetchCertificates]);
  
  // Validate and restore company selection when companies are loaded
  useEffect(() => {
    if (companies.length === 0) {
      // If there are no companies available, clear the selected company
      if (selectedCompany !== null) {
        console.log("No companies available, clearing selected company");
        setSelectedCompany(null);
      }
      return;
    }
    
    // Check if the current selected company is valid
    const isCurrentCompanyValid = selectedCompany && 
      companies.some(c => c.id === selectedCompany.id);
    
    if (!isCurrentCompanyValid) {
      try {
        // Try to restore from localStorage
        const savedCompany = localStorage.getItem("selectedCompany");
        if (savedCompany) {
          const parsedCompany = JSON.parse(savedCompany);
          // Find the company in the current companies list to ensure it's valid
          const foundCompany = companies.find(c => c.id === parsedCompany.id);
          if (foundCompany) {
            console.log("Restoring company from localStorage:", foundCompany.name);
            setSelectedCompany(foundCompany);
          } else {
            // If the saved company is not in the current list, select the first one
            console.log("Saved company not found in list, selecting first company");
            setSelectedCompany(companies[0]);
          }
        } else if (companies.length > 0) {
          // If no saved company, select the first one
          console.log("No saved company, selecting first company");
          setSelectedCompany(companies[0]);
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

  // Validate and restore certificate selection when certificates are loaded
  useEffect(() => {
    if (certificates.length === 0) {
      // If there are no certificates available, clear the selected certificate
      if (selectedCertificate !== null) {
        console.log("No certificates available, clearing selected certificate");
        setSelectedCertificate(null);
      }
      return;
    }
    
    // Check if the current selected certificate is valid
    const isCurrentCertificateValid = selectedCertificate && 
      certificates.some(c => c.id === selectedCertificate.id);
    
    if (!isCurrentCertificateValid) {
      try {
        // Try to restore from localStorage
        const savedCertificate = localStorage.getItem("selectedCertificate");
        if (savedCertificate) {
          const parsedCertificate = JSON.parse(savedCertificate);
          // Find the certificate in the current certificates list to ensure it's valid
          const foundCertificate = certificates.find(c => c.id === parsedCertificate.id);
          if (foundCertificate) {
            console.log("Restoring certificate from localStorage");
            setSelectedCertificate(foundCertificate);
          } else {
            // If the saved certificate is not in the current list, select the first one
            console.log("Saved certificate not found in list, selecting first certificate");
            setSelectedCertificate(certificates[0]);
          }
        } else if (certificates.length > 0) {
          // If no saved certificate, select the first one
          console.log("No saved certificate, selecting first certificate");
          setSelectedCertificate(certificates[0]);
        }
      } catch (error) {
        console.error("Error restoring selected certificate:", error);
        // In case of error, select the first certificate
        if (certificates.length > 0) {
          setSelectedCertificate(certificates[0]);
        }
      }
    }
  }, [certificates, selectedCertificate, setSelectedCertificate]);

  // Save selected organization to localStorage when it changes
  useEffect(() => {
    if (selectedOrganization) {
      localStorage.setItem("selectedOrganization", JSON.stringify(selectedOrganization));
    } else {
      localStorage.removeItem("selectedOrganization");
    }
  }, [selectedOrganization]);

  // Save selected company to localStorage when it changes
  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem("selectedCompany");
    }
  }, [selectedCompany]);

  // Save selected certificate to localStorage when it changes
  useEffect(() => {
    if (selectedCertificate) {
      localStorage.setItem("selectedCertificate", JSON.stringify(selectedCertificate));
    } else {
      localStorage.removeItem("selectedCertificate");
    }
  }, [selectedCertificate]);
  
  // Mark initial load as complete after the first render cycle
  useEffect(() => {
    if (isInitialLoad.current) {
      // Use a short timeout to ensure this happens after the initial data loading
      const timer = setTimeout(() => {
        console.log("Initial load complete");
        isInitialLoad.current = false;
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
