"use client";

import { useEffect, useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import {
  DocumentHeader,
  DocumentStatistics,
  DocumentTable,
  DocumentDetails,
  DocumentNotes,
  UploadDocumentDialog,
  DocumentEmptyState,
  DocumentLoadingState,
  DocumentContentLayout,
} from "@/components/documents";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Document } from "@/types/document";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Documents() {
  const { selectedCertificate } = useCertificateStore();
  const {
    documents,
    selectedDocument,
    searchTerm,
    isUploadDialogOpen,
    isLoading,
    isClassifying,
    fetchDocuments,
    setDocuments,
    setSearchTerm,
    setSelectedDocument,
    setIsUploadDialogOpen,
    handleUploadComplete,
    handleViewDocument,
    handleAiClassification,
    getFilteredDocuments,
    getDocumentStats,
    deleteDocument,
  } = useDocumentStore();

  // Set up real-time subscription for documents
  useEffect(() => {
    let subscription: any = null;

    const setupSubscription = async () => {
      if (!selectedCertificate?.id) return;

      try {
        // Initial fetch - only do this once when the certificate changes
        await fetchDocuments(selectedCertificate.id);

        // Set up real-time subscription
        subscription = supabaseBrowserClient
          .channel(`documents-${selectedCertificate.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_documents",
              filter: `client_certificate_id=eq.${selectedCertificate.id}`,
            },
            async (payload) => {
              console.log("Document inserted:", payload);
              await fetchDocuments(selectedCertificate.id);
            }
          )
          .subscribe((status) => {
            console.log("Subscription status:", status);
          });
      } catch (err) {
        console.error("Error setting up documents subscription:", err);
      }
    };

    setupSubscription();

    // Cleanup subscription when component unmounts or certificate changes
    return () => {
      if (subscription) {
        supabaseBrowserClient.removeChannel(subscription);
      }
    };
  }, [selectedCertificate?.id]); // Only re-run when certificate changes

  // Get filtered documents and stats
  const filteredDocuments = getFilteredDocuments();
  const documentStats = getDocumentStats();

  // Render the document table section based on state
  const renderTableSection = () => {
    if (!selectedCertificate?.id) {
      return (
        <DocumentEmptyState
          icon={<FileText className="text-muted-foreground" />}
          title="No certificate selected"
          description="Please select a certificate from the sidebar to view associated documents."
        />
      );
    }

    if (isLoading) {
      return <DocumentLoadingState />;
    }

    if (filteredDocuments.length === 0) {
      return (
        <DocumentEmptyState
          icon={<FileText className="text-muted-foreground" />}
          title="No documents found"
          description="No documents are associated with the selected certificate. Upload a document to get started."
          actionLabel="Upload Document"
          onAction={() => setIsUploadDialogOpen(true)}
        />
      );
    }

    return (
      <DocumentTable
        documents={filteredDocuments}
        selectedDocument={selectedDocument}
        onSelectDocument={setSelectedDocument}
        onDeleteDocument={deleteDocument}
      />
    );
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <DocumentHeader
        onAddDocument={() => setIsUploadDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAiClassification={() =>
          selectedCertificate?.id &&
          handleAiClassification(selectedCertificate.id)
        }
        isClassifying={isClassifying}
      />

      <DocumentStatistics stats={documentStats} />

      {/* Main Content */}
      <DocumentContentLayout
        tableSection={renderTableSection()}
        detailsSection={
          <DocumentDetails
            document={selectedDocument}
            onViewDocument={handleViewDocument}
            onDeleteDocument={deleteDocument}
          />
        }
      />

      {/* ISO 9001-Specific Notes */}
      <DocumentNotes />

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
