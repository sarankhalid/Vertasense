"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document } from "@/types/document";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import {
  getDocumentTypeFromMime,
  generateDocumentId,
  removeFileExtension,
  getFileExtension
} from "@/components/documents/document-type-utils";

interface DocumentStats {
  total: number;
  approved: number;
  underReview: number;
  draft: number;
  byType: {
    procedures: number;
    workInstructions: number;
    forms: number;
    manuals: number;
  };
}

interface DocumentState {
  // Data
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  isUploadDialogOpen: boolean;
  isClassifying: boolean;

  // Actions
  setDocuments: (documents: Document[]) => void;
  setSelectedDocument: (document: Document | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsError: (error: boolean) => void;
  setSearchTerm: (term: string) => void;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  setIsClassifying: (isClassifying: boolean) => void;

  // API methods
  fetchDocuments: (certificateId: string) => Promise<void>;
  uploadDocument: (file: File, certificateId: string) => Promise<{ data: Document | null; error: string | null }>;
  deleteDocument: (id: string) => Promise<{ success: boolean; error: string | null }>;
  handleUploadComplete: (files: any[]) => void;
  handleViewDocument: (document: Document) => void;
  handleAiClassification: (certificateId: string) => Promise<void>;

  // Computed properties
  getFilteredDocuments: () => Document[];
  getDocumentStats: () => DocumentStats;

  // Reset
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Initial state
      documents: [],
      selectedDocument: null,
      isLoading: false,
      isError: false,
      searchTerm: "",
      isUploadDialogOpen: false,
      isClassifying: false,

      // Actions
      setDocuments: (documents) => set({ documents }),
      setSelectedDocument: (document) => set({ selectedDocument: document }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsError: (error) => set({ isError: error }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),
      setIsClassifying: (isClassifying) => set({ isClassifying: isClassifying }),

  // API methods
  fetchDocuments: async (certificateId) => {
    if (!certificateId) {
      set({ documents: [], isLoading: false });
      return;
    }

    set({ isLoading: true, isError: false });
    try {
      const { data, error } = await supabaseBrowserClient
        .from("user_documents")
        .select("*")
        .eq("client_certificate_id", certificateId)
        .order("created_at", { ascending: false });
      
      console.log("Fetched documents data:", data);
      
      if (error) {
        console.error("Error fetching documents:", error);
        set({ documents: [], isError: true });
      } else {
        // Map the data to the Document type
        const mappedDocuments = data.map((item: any) => {
          // Parse JSON strings if they exist
          let documentsTags = null;
          let mappedClauses = null;

          try {
            if (item.documents_tags) {
              documentsTags = typeof item.documents_tags === 'string'
                ? JSON.parse(item.documents_tags)
                : item.documents_tags;
            }
          } catch (e) {
            console.error(`Error parsing documents_tags for document ${item.id}:`, e);
          }

          try {
            if (item.mapped_clauses) {
              mappedClauses = typeof item.mapped_clauses === 'string'
                ? JSON.parse(item.mapped_clauses)
                : item.mapped_clauses;
            }
          } catch (e) {
            console.error(`Error parsing mapped_clauses for document ${item.id}:`, e);
          }

          // Extract clause numbers from mapped_clauses if available
          let clauses: string[] = [];
          try {
            if (mappedClauses && mappedClauses.clause_mappings) {
              // Check if clause_mappings is an array
              if (Array.isArray(mappedClauses.clause_mappings)) {
                clauses = mappedClauses.clause_mappings.map((mapping: any) => mapping.clause_number);
              } 
              // If it's an object with clause_number property
              else if (mappedClauses.clause_mappings && typeof mappedClauses.clause_mappings === 'object') {
                // Handle the case where clause_mappings is an object instead of an array
                console.log("Clause mappings is an object:", mappedClauses.clause_mappings);
                if (mappedClauses.clause_mappings.clause_number) {
                  clauses = [mappedClauses.clause_mappings.clause_number];
                }
              }
            } else if (item.mapped_clauses && typeof item.mapped_clauses === 'string' && !item.mapped_clauses.startsWith('{')) {
              // Fallback to the old format if needed
              clauses = item.mapped_clauses.split(",");
            }
          } catch (e) {
            console.error(`Error extracting clauses for document ${item.id}:`, e);
            clauses = [];
          }

          // Safely extract the file type
          let fileType = "UNKNOWN";
          try {
            if (item.type && item.type.includes("/")) {
              fileType = item.type.split("/")[1].toUpperCase();
            } else {
              fileType = item.type || "UNKNOWN";
            }
          } catch (e) {
            console.error(`Error extracting file type for document ${item.id}:`, e);
          }

          return {
            id: item.id,
            title: item.name || `Document-${item.id}`,
            type: fileType,
            isAiClassified: item.is_ai_classified || false,
            clauses: clauses,
            certificate: item.client_certificate_id,
            status: item.processing_status === "classification_completed" ? "Approved" : "Processing",
            version: "1.0",
            lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "Unknown",
            owner: "System",
            fileUrl: item.path,
            fileName: item.name || `Document-${item.id}`,
            fileType: item.type || "Unknown",
            fileSize: item.size || 0,
            uploadedAt: item.created_at || new Date().toISOString(),
            certificateId: item.client_certificate_id,
            processing_status: item.processing_status || "processing",
            extension: item.extension || (item.name ? getFileExtension(item.name) : ""),
            documents_tags: documentsTags,
            mapped_clauses: mappedClauses,
          };
        });

        set({ documents: mappedDocuments });

        // Set the first document as selected if available and no document is currently selected
        const { selectedDocument } = get();
        if (mappedDocuments.length > 0) {
          // If there's a selected document, check if it still exists in the new data
          if (selectedDocument) {
            const stillExists = mappedDocuments.some(doc => doc.id === selectedDocument.id);
            if (!stillExists) {
              // If the selected document no longer exists, select the first one
              set({ selectedDocument: mappedDocuments[0] });
            } else {
              // If it still exists, update it with the latest data
              const updatedSelectedDoc = mappedDocuments.find(doc => doc.id === selectedDocument.id);
              set({ selectedDocument: updatedSelectedDoc || null });
            }
          } else {
            // If no document is selected, select the first one
            set({ selectedDocument: mappedDocuments[0] });
          }
        } else if (selectedDocument) {
          // If there are no documents but there's a selected document, clear it
          set({ selectedDocument: null });
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      set({ documents: [], isError: true });
    } finally {
      set({ isLoading: false });
    }
  },

      uploadDocument: async (file, certificateId) => {
        if (!certificateId) {
          return { data: null, error: "Certificate ID is required" };
        }

        try {
          // Generate a unique file path
          const fileName = file.name;
          const filePath = `${certificateId}/${Date.now()}_${fileName}`;

          // Upload the file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabaseBrowserClient.storage
            .from('certification-documents')
            .upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            return { data: null, error: uploadError.message };
          }

          // Get the public URL for the uploaded file
          const { data: urlData } = supabaseBrowserClient.storage
            .from('certification-documents')
            .getPublicUrl(filePath);

          const fileUrl = urlData.publicUrl;

          // Create a document record in the database
          const documentData = {
            name: fileName,
            type: file.type,
            size: file.size,
            path: fileUrl,
            client_certificate_id: certificateId,
            processing_status: "processing", // Initial status
            extension: getFileExtension(fileName), // Add file extension
          };

          const { data: documentRecord, error: documentError } = await supabaseBrowserClient
            .from("user_documents")
            .insert(documentData)
            .select()
            .single();

          if (documentError) {
            console.error("Error creating document record:", documentError);
            return { data: null, error: documentError.message };
          }

          // Create a Document object
          const newDocument: Document = {
            id: documentRecord.id,
            title: removeFileExtension(fileName),
            type: getDocumentTypeFromMime(file.type),
            isAiClassified: false,
            clauses: [],
            certificate: certificateId,
            status: "Processing",
            version: "1.0",
            lastUpdated: new Date().toLocaleDateString(),
            owner: "System",
            fileUrl: fileUrl,
            fileName: fileName,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            certificateId: certificateId,
            processing_status: "processing",
            extension: getFileExtension(fileName), // Add file extension
          };

          // Update the documents list with the new document
          const { documents } = get();
          set({
            documents: [newDocument, ...documents],
            selectedDocument: newDocument
          });

          // Start polling for updates on this specific document
          const startTime = new Date().toISOString();
          const maxPollingTime = 3 * 60 * 1000; // 3 minutes maximum polling time
          const pollingInterval = 5000; // Check every 5 seconds
          let elapsedTime = 0;

          const checkDocumentStatus = async () => {
            try {
              const { data, error } = await supabaseBrowserClient
                .from("user_documents")
                .select("*")
                .eq("id", documentRecord.id)
                .single();

              if (error) {
                console.error("Error fetching document status:", error);
                return false;
              }

              // If the document status has changed, update the document list
              if (data && data.processing_status === "classification_completed") {
                const { fetchDocuments } = get();
                await fetchDocuments(certificateId);
                return true;
              }

              return false;
            } catch (err) {
              console.error("Error checking document status:", err);
              return false;
            }
          };

          const intervalId = setInterval(async () => {
            elapsedTime += pollingInterval;

            // Check if document is processed or we've reached the max polling time
            const isCompleted = await checkDocumentStatus();
            if (isCompleted || elapsedTime >= maxPollingTime) {
              clearInterval(intervalId);

              // Final fetch to ensure we have the latest data
              const { fetchDocuments } = get();
              fetchDocuments(certificateId);
            }
          }, pollingInterval);

          return { data: newDocument, error: null };
        } catch (err: any) {
          console.error("Failed to upload document:", err);
          return { data: null, error: err.message || "Failed to upload document" };
        }
      },

      deleteDocument: async (id) => {
        try {
          // Get the document to delete
          const { documents } = get();
          const documentToDelete = documents.find(doc => doc.id === id);

          if (!documentToDelete) {
            return { success: false, error: "Document not found" };
          }

          // Delete the document record from the database
          const { error: deleteError } = await supabaseBrowserClient
            .from("user_documents")
            .delete()
            .eq("id", id);

          if (deleteError) {
            console.error("Error deleting document record:", deleteError);
            return { success: false, error: deleteError.message };
          }

          // Extract the file path from the URL
          if (documentToDelete.fileUrl) {
            const url = new URL(documentToDelete.fileUrl);
            const pathParts = url.pathname.split('/');
            const bucketPath = pathParts.slice(pathParts.indexOf('documents') + 1).join('/');

            // Delete the file from storage
            const { error: storageError } = await supabaseBrowserClient.storage
              .from('certification-documents')
              .remove([bucketPath]);

            if (storageError) {
              console.error("Error deleting file from storage:", storageError);
              // Continue anyway as the database record is deleted
            }
          }

          // Remove the document from the documents list
          const updatedDocuments = documents.filter(doc => doc.id !== id);

          set({ documents: updatedDocuments });

          // If the deleted document was selected, select another document if available
          const { selectedDocument } = get();
          if (selectedDocument && selectedDocument.id === id) {
            if (updatedDocuments.length > 0) {
              set({ selectedDocument: updatedDocuments[0] });
            } else {
              set({ selectedDocument: null });
            }
          }

          return { success: true, error: null };
        } catch (err: any) {
          console.error("Failed to delete document:", err);
          return { success: false, error: err.message || "Failed to delete document" };
        }
      },

      // Computed properties
      getFilteredDocuments: () => {
        const { documents, searchTerm } = get();

        if (!searchTerm) {
          return documents;
        }

        return documents.filter(doc => {
          const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesSearch;
        });
      },

      getDocumentStats: () => {
        const { documents } = get();

        return {
          total: documents.length,
          approved: documents.filter((doc) => doc.status === "Approved").length,
          underReview: documents.filter((doc) => doc.status === "Under Review").length,
          draft: documents.filter((doc) => doc.status === "Draft").length,
          byType: {
            procedures: documents.filter((doc) =>
              doc.type.toLowerCase().includes("procedure")
            ).length,
            workInstructions: documents.filter((doc) =>
              doc.type.toLowerCase().includes("instruction")
            ).length,
            forms: documents.filter((doc) =>
              doc.type.toLowerCase().includes("form")
            ).length,
            manuals: documents.filter(
              (doc) =>
                doc.type.toLowerCase().includes("manual") ||
                doc.type.toLowerCase().includes("policy") ||
                doc.type.toLowerCase().includes("pdf")
            ).length,
          },
        };
      },

      // Document operations
      handleUploadComplete: (files) => {
        // Get the current state
        const { documents } = get();

        // Map uploaded files to Document type
        const newDocuments = files.map((file) => {
          return {
            id: generateDocumentId(),
            title: removeFileExtension(file.file.name),
            type: getDocumentTypeFromMime(file.file.type),
            isAiClassified: false,
            clauses: [],
            certificate: file.certificateId || "",
            status: "Processing",
            version: "1.0",
            lastUpdated: new Date().toISOString().split("T")[0],
            owner: "Current User",
            fileUrl: file.url || file.path,
            fileName: file.file.name,
            fileType: file.file.type,
            fileSize: file.file.size,
            uploadedAt: new Date().toISOString(),
            certificateId: file.certificateId,
            processing_status: "processing",
            extension: getFileExtension(file.file.name), // Add file extension
          } as Document;
        });

        // Update the documents list with the new documents
        set({
          documents: [...newDocuments, ...documents],
          selectedDocument: newDocuments[0] || null
        });

        // Start polling for updates on these documents
        if (newDocuments.length > 0 && newDocuments[0].certificateId) {
          const certificateId = newDocuments[0].certificateId;
          const startTime = new Date().toISOString();
          const maxPollingTime = 3 * 60 * 1000; // 3 minutes maximum polling time
          const pollingInterval = 5000; // Check every 5 seconds
          let elapsedTime = 0;

          const checkDocumentsStatus = async () => {
            try {
              // Fetch only documents that have been updated since we started
              const { data, error } = await supabaseBrowserClient
                .from("user_documents")
                .select("*")
                .eq("client_certificate_id", certificateId)
                .gt("updated_at", startTime)
                .order("updated_at", { ascending: false });

              if (error) {
                console.error("Error fetching updated documents:", error);
                return false;
              }

              // If we have updates, refresh the full document list
              if (data && data.length > 0) {
                const { fetchDocuments } = get();
                await fetchDocuments(certificateId);

                // Check if all uploaded documents have completed processing
                const uploadedIds = newDocuments.map(doc => doc.id);
                const updatedDocs = data.filter(doc => uploadedIds.includes(doc.id));
                const allCompleted = updatedDocs.length === uploadedIds.length &&
                  updatedDocs.every(doc => doc.processing_status === "classification_completed");

                return allCompleted;
              }

              return false;
            } catch (err) {
              console.error("Error checking documents status:", err);
              return false;
            }
          };

          const intervalId = setInterval(async () => {
            elapsedTime += pollingInterval;

            // Check if documents are processed or we've reached the max polling time
            const allCompleted = await checkDocumentsStatus();
            if (allCompleted || elapsedTime >= maxPollingTime) {
              clearInterval(intervalId);

              // Final fetch to ensure we have the latest data
              const { fetchDocuments } = get();
              fetchDocuments(certificateId);
            }
          }, pollingInterval);
        }
      },

      handleViewDocument: (document) => {
        if (document.fileUrl) {
          window.open(document.fileUrl, "_blank");
        }
      },

      handleAiClassification: async (certificateId) => {
        if (!certificateId) {
          console.error("No certificate selected");
          return;
        }

        set({ isClassifying: true });

        try {
          const {
            data: { session },
          } = await supabaseBrowserClient.auth.getSession();

          // Call the Next.js API endpoint for document classification
          const response = await fetch("/api/document-classification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              selectedCertificateId: certificateId,
            }),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }

          // Get the current timestamp to fetch only documents updated after this time
          const startTime = new Date().toISOString();

          // Start polling for updates with a smarter approach
          const maxPollingTime = 5 * 60 * 1000; // 5 minutes maximum polling time
          const pollingInterval = 5000; // Check every 5 seconds
          let elapsedTime = 0;

          const checkForUpdates = async () => {
            try {
              // Fetch only documents that have been updated since we started the classification
              const { data, error } = await supabaseBrowserClient
                .from("user_documents")
                .select("*")
                .eq("client_certificate_id", certificateId)
                .gt("updated_at", startTime)
                .order("updated_at", { ascending: false });

              if (error) {
                console.error("Error fetching updated documents:", error);
                return false;
              }

              // Check if all documents have completed processing
              const allCompleted = data.every(
                (doc) => doc.processing_status === "classification_completed"
              );

              // If we have updates, refresh the full document list
              if (data.length > 0) {
                const { fetchDocuments } = get();
                await fetchDocuments(certificateId);
              }

              return allCompleted && data.length > 0;
            } catch (err) {
              console.error("Error checking for updates:", err);
              return false;
            }
          };

          const intervalId = setInterval(async () => {
            elapsedTime += pollingInterval;

            // Check if all documents are processed or we've reached the max polling time
            const allCompleted = await checkForUpdates();
            if (allCompleted || elapsedTime >= maxPollingTime) {
              clearInterval(intervalId);
              set({ isClassifying: false });

              // Final fetch to ensure we have the latest data
              const { fetchDocuments } = get();
              fetchDocuments(certificateId);
            }
          }, pollingInterval);

          // Immediately fetch updated data
          const { fetchDocuments } = get();
          fetchDocuments(certificateId);
        } catch (error) {
          console.error("Error during AI classification:", error);
          set({ isClassifying: false });
        }
      },

      // Reset
      clearDocuments: () => {
        set({
          documents: [],
          selectedDocument: null,
          isLoading: false,
          isError: false,
          searchTerm: "",
          isUploadDialogOpen: false,
          isClassifying: false
        });
      },
    }),
    {
      name: "document-storage",
      partialize: (state) => ({
        selectedDocument: state.selectedDocument,
        searchTerm: state.searchTerm,
        isUploadDialogOpen: state.isUploadDialogOpen,
      }),
    }
  )
);
