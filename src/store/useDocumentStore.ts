"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document, UserDocument } from "@/types/document";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import {
  getDocumentTypeFromMime,
  generateDocumentId,
  removeFileExtension,
  getFileExtension
} from "@/components/documents/document-type-utils";

// Helper functions for document processing
const parseJsonField = (field: any): any => {
  if (!field) return null;
  
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (e) {
    console.error(`Error parsing JSON field:`, e);
    return null;
  }
};

const extractClauses = (mappedClauses: any, item: any): string[] => {
  let clauses: string[] = [];
  
  try {
    if (mappedClauses && mappedClauses.clause_mappings) {
      // Check if clause_mappings is an array
      if (Array.isArray(mappedClauses.clause_mappings)) {
        clauses = mappedClauses.clause_mappings.map((mapping: any) => mapping.clause_number);
      }
      // If it's an object with clause_number property
      else if (mappedClauses.clause_mappings && typeof mappedClauses.clause_mappings === 'object') {
        if (mappedClauses.clause_mappings.clause_number) {
          clauses = [mappedClauses.clause_mappings.clause_number];
        }
      }
    } else if (item.mapped_clauses && typeof item.mapped_clauses === 'string') {
      // Fallback to the old format if needed
      if (!item.mapped_clauses.startsWith('{')) {
        clauses = item.mapped_clauses.split(",");
      }
    }
  } catch (e) {
    console.error(`Error extracting clauses:`, e);
    clauses = [];
  }
  
  return clauses;
};

const getFileTypeFromItem = (item: any): string => {
  try {
    if (item.type && item.type.includes("/")) {
      return item.type.split("/")[1].toUpperCase();
    } else {
      return item.type || "UNKNOWN";
    }
  } catch (e) {
    console.error(`Error extracting file type:`, e);
    return "UNKNOWN";
  }
};

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

      // Helper methods
      processDocumentData: (item: UserDocument) => Document;

  // Document CRUD operations
  addDocument: (document: Document) => void;
  updateDocument: (updatedDocument: Document) => void;
  removeDocument: (documentId: string) => void;

  // API methods
  fetchDocuments: (certificateId: string) => Promise<void>;
  uploadDocument: (file: File, certificateId: string) => Promise<{ data: Document | null; error: string | null }>;
  deleteDocument: (id: string) => Promise<{ success: boolean; error: string | null }>;
  // handleUploadComplete: (files: any[]) => void;
  handleViewDocument: (document: Document) => void;
  // handleAiClassification: (certificateId: string) => Promise<void>;

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

      // Helper function to process document data from Supabase into Document type
      processDocumentData: (item: any): Document => {
        // Parse JSON fields safely
        const documentsTags = parseJsonField(item.documents_tags);
        const mappedClauses = parseJsonField(item.mapped_clauses);
        
        // Extract clauses from mapped_clauses
        const clauses = extractClauses(mappedClauses, item);
        
        // Get file type
        const fileType = getFileTypeFromItem(item);
        
        // Create and return the document object
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
      },

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
            // Map the data to the Document type using the helper function
            const mappedDocuments = data.map((item: any) => get().processDocumentData(item));

            // Set the first document as selected if available and no document is currently selected
            const { selectedDocument } = get();
            let newSelectedDocument = null;
            
            if (mappedDocuments.length > 0) {
              // If there's a selected document, check if it still exists in the new data
              if (selectedDocument) {
                const stillExists = mappedDocuments.some(doc => doc.id === selectedDocument.id);
                if (!stillExists) {
                  // If the selected document no longer exists, select the first one
                  newSelectedDocument = mappedDocuments[0];
                } else {
                  // If it still exists, update it with the latest data
                  newSelectedDocument = mappedDocuments.find(doc => doc.id === selectedDocument.id) || null;
                }
              } else {
                // If no document is selected, select the first one
                newSelectedDocument = mappedDocuments[0];
              }
            }
            
            // Update both documents array and selectedDocument in a single state update
            set({ 
              documents: mappedDocuments,
              selectedDocument: newSelectedDocument
            });
          }
        } catch (err) {
          console.error("Failed to fetch documents:", err);
          set({ documents: [], isError: true });
        } finally {
          set({ isLoading: false });
        }
      },

      // Add a new document to the store
      addDocument: (document: Document) => {
        const { documents } = get();
        set({ documents: [document, ...documents] });
      },

      // Update a specific document in the store
      updateDocument: (updatedDocument: Document) => {
        const { documents, selectedDocument } = get();

        // Update the document in the documents array
        const updatedDocuments = documents.map(doc =>
          doc.id === updatedDocument.id ? updatedDocument : doc
        );

        // Update both documents array and selectedDocument in a single state update
        // to prevent multiple re-renders
        if (selectedDocument && selectedDocument.id === updatedDocument.id) {
          set({ 
            documents: updatedDocuments,
            selectedDocument: updatedDocument 
          });
        } else {
          set({ documents: updatedDocuments });
        }
      },

      // Remove a document from the store
      removeDocument: (documentId: string) => {
        const { documents, selectedDocument } = get();

        // Filter out the document to be removed
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);

        // If the removed document was selected, select another document if available
        // and update both documents array and selectedDocument in a single state update
        if (selectedDocument && selectedDocument.id === documentId) {
          if (updatedDocuments.length > 0) {
            set({ 
              documents: updatedDocuments,
              selectedDocument: updatedDocuments[0] 
            });
          } else {
            set({ 
              documents: updatedDocuments,
              selectedDocument: null 
            });
          }
        } else {
          set({ documents: updatedDocuments });
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

          // If the deleted document was selected, select another document if available
          // and update both documents array and selectedDocument in a single state update
          const { selectedDocument } = get();
          if (selectedDocument && selectedDocument.id === id) {
            if (updatedDocuments.length > 0) {
              set({ 
                documents: updatedDocuments,
                selectedDocument: updatedDocuments[0] 
              });
            } else {
              set({ 
                documents: updatedDocuments,
                selectedDocument: null 
              });
            }
          } else {
            set({ documents: updatedDocuments });
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

      handleViewDocument: (document) => {
        if (document.fileUrl) {
          window.open(document.fileUrl, "_blank");
        }
      },

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
