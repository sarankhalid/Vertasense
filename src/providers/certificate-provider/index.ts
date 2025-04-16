"use client";

import { dataProvider } from "@/providers/data-provider";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { liveProvider } from "@/providers/live-provider";
// import { createSupabaseServerClient } from "@/utils/supabase/server";
import { CrudFilters, CrudSorting } from "@refinedev/core";

export interface Certificate {
  id: string;
  name: string;
  standard: string;
  framework: string;
  progress: number;
  certified?: boolean;
  controls?: number;
  total?: number;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export const certificateProvider = {
  // Get all certifications 
  getAllCertifications: async () => {
    const { data: certifications, error: certificationsError } = await supabaseBrowserClient
      .from("certifications")
      .select("*")

    return { data: certifications, error: certificationsError };


  },
  // Get all certificates for a company
  getCertificates: async (companyId?: string) => {
    // If no company ID is provided, get the user's selected company
    if (!companyId) {
      const storedCompany = localStorage.getItem("selectedCompany");
      if (storedCompany) {
        const company = JSON.parse(storedCompany);
        companyId = company.id;
      } else {
        return { data: [], error: "No company selected" };
      }
    }

    // Get certificates for the company
    const { data: clientCertificates, error: clientCertificatesError } = await supabaseBrowserClient
      .from("client_certifications")
      .select("*, certifications(*)")  // Fetch all fields from client_certifications and related data from certifications
      .eq("organization_id", companyId);

    console.log("Client Certifications : ", clientCertificates)

    if (clientCertificatesError) {
      console.error("Error fetching org relations:", clientCertificatesError);
      return { data: [], error: clientCertificatesError.message };
    }

    if (!clientCertificates || clientCertificates.length === 0) {
      return { data: [], error: null };
    }

    return { data: clientCertificates, error: null };
  },

  // Get a single certificate by ID
  getCertificate: async (id: string) => {
    const { data, error } = await supabaseBrowserClient
      .from("certificates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Create a new certificate
  createCertificate: async (certificateData: Omit<Certificate, "id" | "created_at" | "updated_at">) => {
    // Insert the certificate
    const { data, error } = await supabaseBrowserClient
      .from("certificates")
      .insert([certificateData])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Publish a live event for the new certificate
    liveProvider.publish?.({
      channel: "certificates",
      type: "created",
      payload: {
        ids: [data.id],
      },
      date: new Date(),
    });

    return { data, error: null };
  },

  // Update a certificate
  updateCertificate: async (id: string, certificateData: Partial<Omit<Certificate, "id" | "created_at" | "updated_at">>) => {
    const { data, error } = await supabaseBrowserClient
      .from("certificates")
      .update(certificateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  // Delete a certificate
  deleteCertificate: async (id: string) => {
    const { error } = await supabaseBrowserClient
      .from("certificates")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  // Get certificate controls
  getCertificateControls: async (certificateId: string) => {
    const { data, error } = await supabaseBrowserClient
      .from("certificate_controls")
      .select("*")
      .eq("certificate_id", certificateId);

    if (error) {
      return { data: [], error: error.message };
    }

    return { data, error: null };
  },

  // Add a control to a certificate
  addCertificateControl: async (certificateId: string, controlData: any) => {
    const { data, error } = await supabaseBrowserClient
      .from("certificate_controls")
      .insert([
        {
          certificate_id: certificateId,
          ...controlData,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Update the certificate progress
    await certificateProvider.updateCertificateProgress(certificateId);

    return { data, error: null };
  },

  // Update a certificate control
  updateCertificateControl: async (controlId: string, controlData: any) => {
    const { data: controlData_, error: controlError } = await supabaseBrowserClient
      .from("certificate_controls")
      .select("certificate_id")
      .eq("id", controlId)
      .single();

    if (controlError) {
      return { data: null, error: controlError.message };
    }

    const { data, error } = await supabaseBrowserClient
      .from("certificate_controls")
      .update(controlData)
      .eq("id", controlId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Update the certificate progress
    await certificateProvider.updateCertificateProgress(controlData_.certificate_id);

    return { data, error: null };
  },

  // Delete a certificate control
  deleteCertificateControl: async (controlId: string) => {
    const { data: controlData, error: controlError } = await supabaseBrowserClient
      .from("certificate_controls")
      .select("certificate_id")
      .eq("id", controlId)
      .single();

    if (controlError) {
      return { success: false, error: controlError.message };
    }

    const { error } = await supabaseBrowserClient
      .from("certificate_controls")
      .delete()
      .eq("id", controlId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update the certificate progress
    await certificateProvider.updateCertificateProgress(controlData.certificate_id);

    return { success: true, error: null };
  },

  // Update certificate progress based on controls
  updateCertificateProgress: async (certificateId: string) => {
    // Get all controls for the certificate
    const { data: controls, error: controlsError } = await supabaseBrowserClient
      .from("certificate_controls")
      .select("*")
      .eq("certificate_id", certificateId);

    if (controlsError) {
      return { success: false, error: controlsError.message };
    }

    // Calculate progress
    const total = controls.length;
    const completed = controls.filter((control) => control.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const certified = progress === 100;

    // Update the certificate
    const { error } = await supabaseBrowserClient
      .from("certificates")
      .update({
        progress,
        certified,
        controls: total - completed,
        total,
      })
      .eq("id", certificateId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },
};


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

// Refine data provider for certificates
export const certificateDataProvider = {
  ...dataProvider,

  // Override the getList method to use our custom getCertificates method
  getList: async ({ resource, pagination, filters, sorters, meta }: GetListParams) => {
    if (resource === "certificates") {
      // Check if company_id is provided in meta
      const companyId = meta?.company_id;

      const { data, error } = await certificateProvider.getCertificates(companyId);

      if (error) {
        throw new Error(error);
      }

      return {
        data,
        total: data.length,
      };
    } else if (resource === "certificate_controls") {
      // Check if certificate_id is provided in meta
      const certificateId = meta?.certificate_id;

      if (!certificateId) {
        throw new Error("certificate_id is required in meta");
      }

      const { data, error } = await certificateProvider.getCertificateControls(certificateId as string);

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

  // Override the getOne method to use our custom getCertificate method
  getOne: async ({ resource, id, meta }: GetOneParams) => {
    if (resource === "certificates") {
      const { data, error } = await certificateProvider.getCertificate(id as string);

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

  // Override the create method to use our custom createCertificate method
  create: async ({ resource, variables, meta }: CreateParams) => {
    if (resource === "certificates") {
      const { data, error } = await certificateProvider.createCertificate(
        variables as Omit<Certificate, "id" | "created_at" | "updated_at">
      );

      if (error) {
        throw new Error(error);
      }

      return {
        data,
      };
    } else if (resource === "certificate_controls") {
      // Check if certificate_id is provided in variables or meta
      const certificateId = variables.certificate_id || meta?.certificate_id;

      if (!certificateId) {
        throw new Error("certificate_id is required in variables or meta");
      }

      const { data, error } = await certificateProvider.addCertificateControl(
        certificateId as string,
        variables
      );

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

  // Override the update method to use our custom updateCertificate method
  update: async ({ resource, id, variables, meta }: UpdateParams) => {
    if (resource === "certificates") {
      const { data, error } = await certificateProvider.updateCertificate(
        id as string,
        variables as Partial<Omit<Certificate, "id" | "created_at" | "updated_at">>
      );

      if (error) {
        throw new Error(error);
      }

      return {
        data,
      };
    } else if (resource === "certificate_controls") {
      const { data, error } = await certificateProvider.updateCertificateControl(
        id as string,
        variables
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

  // Override the deleteOne method to use our custom deleteCertificate method
  deleteOne: async ({ resource, id, meta }: DeleteOneParams) => {
    if (resource === "certificates") {
      const { success, error } = await certificateProvider.deleteCertificate(id as string);

      if (!success) {
        throw new Error(error || "Failed to delete certificate");
      }

      return {
        data: { id },
      };
    } else if (resource === "certificate_controls") {
      const { success, error } = await certificateProvider.deleteCertificateControl(id as string);

      if (!success) {
        throw new Error(error || "Failed to delete certificate control");
      }

      return {
        data: { id },
      };
    }

    // For other resources, use the default data provider
    return dataProvider.deleteOne({ resource, id, meta });
  },
};
