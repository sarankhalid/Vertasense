"use client";

import { Document } from "@/types/document";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCertificateName } from "./document-type-utils";
import { Trash2, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, memo } from "react";
import { toast } from "sonner";

interface DocumentDetailsProps {
  document: Document | null;
  onViewDocument?: (document: Document) => void;
  onDeleteDocument?: (
    id: string
  ) => Promise<{ success: boolean; error: string | null }>;
}

// Using memo to prevent unnecessary re-renders when other parts of the UI change
export const DocumentDetails = memo(function DocumentDetails({
  document,
  onViewDocument,
  onDeleteDocument,
}: DocumentDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDocument = async () => {
    if (!document || !onDeleteDocument) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting document...");

    try {
      const result = await onDeleteDocument(document.id);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Document deleted successfully");
      } else {
        toast.error("Failed to delete document", {
          description: result.error || "Unknown error occurred",
          duration: 5000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred while deleting the document");
      console.error("Error deleting document:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  if (!document) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">DOCUMENT DETAILS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select a document to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">DOCUMENT DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Title</h3>
          <p className="font-medium">{document.title}</p>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Certificate</h3>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-800 border-blue-200"
          >
            {getCertificateName(document.certificate)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Document ID</h3>
            <p className="text-sm">{document.id}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Version</h3>
            <p className="text-sm">{document.version || "1.0"}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Type</h3>
          <Badge variant="outline">{document.type}</Badge>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Status</h3>
          <Badge
            className={
              document.status === "Approved"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {document.status || "Draft"}
          </Badge>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Last Updated</h3>
          <p className="text-sm">{document.lastUpdated || "Not available"}</p>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">Owner</h3>
          <p className="text-sm">{document.owner || "Not assigned"}</p>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-1">
            Related ISO Clauses
          </h3>
          <div className="flex flex-wrap gap-2">
            {document.clauses && document.clauses.length > 0 ? (
              document.clauses.map((clause) => (
                <Badge key={clause} variant="outline">
                  {clause === "All" ? "All Clauses" : `Clause ${clause}`}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                None specified
              </span>
            )}
          </div>
        </div>

        {document.processing_status === "classification_completed" &&
          document.documents_tags && (
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">
                Document Classification
              </h3>
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <div className="mb-2">
                  <span className="font-semibold">Document Types: </span>
                  {Array.isArray(document.documents_tags.document_types)
                    ? document.documents_tags.document_types.join(", ")
                    : "No document types available"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Confidence: </span>
                  {(document.documents_tags.confidence * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-semibold">Rationale: </span>
                  {document.documents_tags.rationale}
                </div>
              </div>
            </div>
          )}

        {document.processing_status === "classification_completed" &&
          document.mapped_clauses && (
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">
                Mapped Clauses Details
              </h3>
              <div className="border rounded-md divide-y">
                {(() => {
                  try {
                    if (Array.isArray(document.mapped_clauses.clause_mappings)) {
                      // Handle array of clause mappings
                      return document.mapped_clauses.clause_mappings.map(
                        (mapping, index) => (
                          <div key={index} className="p-3 text-sm">
                            <div className="font-semibold mb-1">
                              Clause {mapping.clause_number || "Unknown"}
                            </div>
                            <div className="mb-1">
                              <span className="text-muted-foreground">
                                Evidence:{" "}
                              </span>
                              {mapping.evidence || "No evidence provided"}
                            </div>
                            <div className="mb-1">
                              <span className="text-muted-foreground">
                                Relevance:{" "}
                              </span>
                              {mapping.relevance 
                                ? `${(mapping.relevance * 100).toFixed(0)}%` 
                                : "Not specified"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Potential Gaps:{" "}
                              </span>
                              {mapping.potential_gaps || "None identified"}
                            </div>
                          </div>
                        )
                      );
                    } else if (document.mapped_clauses.clause_mappings && 
                              typeof document.mapped_clauses.clause_mappings === 'object') {
                      // Handle single clause mapping object
                      const mapping = document.mapped_clauses.clause_mappings as any;
                      return (
                        <div className="p-3 text-sm">
                          <div className="font-semibold mb-1">
                            Clause {mapping.clause_number || "Unknown"}
                          </div>
                          <div className="mb-1">
                            <span className="text-muted-foreground">Evidence: </span>
                            {mapping.evidence || "No evidence provided"}
                          </div>
                          <div className="mb-1">
                            <span className="text-muted-foreground">Relevance: </span>
                            {mapping.relevance 
                              ? `${(mapping.relevance * 100).toFixed(0)}%` 
                              : "Not specified"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Potential Gaps:{" "}
                            </span>
                            {mapping.potential_gaps || "None identified"}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-3 text-sm text-muted-foreground">
                          No clause mappings available
                        </div>
                      );
                    }
                  } catch (error) {
                    console.error("Error rendering clause mappings:", error);
                    return (
                      <div className="p-3 text-sm text-muted-foreground">
                        Error displaying clause mappings. Please check the console for details.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

        {document.fileUrl && (
          <div className="pt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => onViewDocument && onViewDocument(document)}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Document
            </Button>
            {onDeleteDocument && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{document.title}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDocument}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
});
