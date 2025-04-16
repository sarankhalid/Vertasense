"use client";

import { supabaseBrowserClient } from "@/utils/supabase/client";
import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { Company, companyProvider } from "@/providers/company-provider";

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  loading: boolean;
  // getRelatedCompanies: (organizationId: string) => Promise<{ data: Company[], error: string | null }>;
}

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  selectedCompany: null,
  setSelectedCompany: () => {},
  loading: true,
  // getRelatedCompanies: async () => ({ data: [], error: null }),
});

export const CompanyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const fetchCompanies = async () => {
    //   setLoading(true);

    //   // Get user's role and ID
    //   const { data: userData } = await supabaseBrowserClient.auth.getUser();

    //   if (!userData.user) {
    //     setLoading(false);
    //     return;
    //   }

    //   // Get user's role
    //   const { data: profileData } = await supabaseBrowserClient
    //     .from("profiles")
    //     .select("role")
    //     .eq("id", userData.user.id)
    //     .single();

    //   let companiesQuery;

    //   if (profileData?.role === "admin") {
    //     // Admins can see all companies
    //     companiesQuery = supabaseBrowserClient.from("companies").select("*");
    //   } else {
    //     // Regular users can only see companies they have access to
    //     companiesQuery = supabaseBrowserClient
    //       .from("user_companies")
    //       .select("companies(*)")
    //       .eq("user_id", userData.user.id);
    //   }

    //   const { data, error } = await companiesQuery;

    //   if (error) {
    //     console.error("Error fetching companies:", error);
    //     setLoading(false);
    //     return;
    //   }

    //   // Format the data based on the query structure
    //   let formattedCompanies;
    //   if (profileData?.role === "admin") {
    //     formattedCompanies = data;
    //   } else {
    //     formattedCompanies = data.map((item: any) => item.companies);
    //   }

    //   setCompanies(formattedCompanies);

    //   // Set the first company as selected by default if available
    //   if (formattedCompanies.length > 0 && !selectedCompany) {
    //     setSelectedCompany(formattedCompanies[0]);

    //     // Store the selected company in localStorage
    //     localStorage.setItem(
    //       "selectedCompany",
    //       JSON.stringify(formattedCompanies[0])
    //     );
    //   }

    //   setLoading(false);
    // };

    // fetchCompanies();

    // Try to restore selected company from localStorage
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  }, []);

  const handleSetSelectedCompany = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem("selectedCompany", JSON.stringify(company));
  };

  // Function to get companies related to a specific organization with type "COMPANY"
  const getRelatedCompanies = async (organizationId: string) => {
    return await companyProvider.getRelatedCompanies(organizationId);
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        selectedCompany,
        setSelectedCompany: handleSetSelectedCompany,
        loading,
        // getRelatedCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
