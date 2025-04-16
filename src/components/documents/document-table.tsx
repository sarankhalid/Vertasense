"use client";

import { Document } from "@/types/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { CanAccess } from "@refinedev/core";
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
import { toast } from "sonner";

interface DocumentTableProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onDeleteDocument?: (id: string) => Promise<{ success: boolean; error: string | null }>;
}

export function DocumentTable({
  documents,
  selectedDocument,
  onSelectDocument,
  onDeleteDocument,
}: DocumentTableProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Check if all documents are selected
  const allSelected =
    documents.length > 0 && selectedDocuments.size === documents.length;

  // Check if some documents are selected
  const someSelected =
    selectedDocuments.size > 0 && selectedDocuments.size < documents.length;

  // Toggle selection of a single document
  const toggleDocumentSelection = (docId: string, isChecked: boolean) => {
    const newSelected = new Set(selectedDocuments);

    if (isChecked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }

    setSelectedDocuments(newSelected);
  };

  // Toggle selection of all documents
  const toggleAllDocuments = (isChecked: boolean) => {
    if (isChecked) {
      const allDocIds = documents.map((doc) => doc.id);
      setSelectedDocuments(new Set(allDocIds));
    } else {
      setSelectedDocuments(new Set());
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (onDeleteDocument && selectedDocuments.size > 0) {
      // Show loading toast
      const loadingToast = toast.loading(`Deleting ${selectedDocuments.size} document${selectedDocuments.size > 1 ? 's' : ''}...`);
      
      try {
        // Delete documents one by one
        const deletePromises = Array.from(selectedDocuments).map(async (docId) => {
          const result = await onDeleteDocument(docId);
          return { docId, success: result.success, error: result.error };
        });

        const results = await Promise.all(deletePromises);
        
        // Check for any failures
        const failures = results.filter(r => !r.success);
        const successCount = results.length - failures.length;
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (failures.length > 0) {
          // Some deletions failed
          if (successCount > 0) {
            // Some succeeded, some failed
            toast.warning(`Deleted ${successCount} document${successCount > 1 ? 's' : ''}, but failed to delete ${failures.length} document${failures.length > 1 ? 's' : ''}.`, {
              description: failures.map(f => f.error).join(', '),
              duration: 5000
            });
          } else {
            // All failed
            toast.error(`Failed to delete document${failures.length > 1 ? 's' : ''}.`, {
              description: failures.map(f => f.error).join(', '),
              duration: 5000
            });
          }
          console.error("Failed to delete some documents:", failures);
        } else {
          // All succeeded
          toast.success(`Successfully deleted ${successCount} document${successCount > 1 ? 's' : ''}.`);
        }
      } catch (error) {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        toast.error("An unexpected error occurred while deleting documents.");
        console.error("Error in delete operation:", error);
      }
      
      // Clear selection
      setSelectedDocuments(new Set());
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">DOCUMENT TABLE</CardTitle>
        {selectedDocuments.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedDocuments.size})
          </Button>
        )}
      </CardHeader>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDocuments.size} selected document{selectedDocuments.size > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <CanAccess resource="document" action="delete">
                {/* <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleAllDocuments}
                    aria-label="Select all documents"
                  />
                </TableHead> */}
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    // Use a safer approach for indeterminate state
                    onCheckedChange={toggleAllDocuments}
                    aria-label="Select all documents"
                    data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                  />
                </TableHead>
              </CanAccess>
              <TableHead className="w-[100px]">Doc ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Type (AI)</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">ISO Clause</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow
                key={doc.id}
                className={`cursor-pointer ${
                  selectedDocument?.id === doc.id ? "bg-muted/50" : ""
                }`}
                onClick={() => onSelectDocument(doc)}
              >
                <CanAccess resource="document" action="delete">
                  <TableCell className="w-[40px]">
                    <Checkbox
                      checked={selectedDocuments.has(doc.id)}
                      onCheckedChange={(checked) =>
                        toggleDocumentSelection(doc.id, checked === true)
                      }
                      aria-label={`Select ${doc.title}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                </CanAccess>
                <TableCell className="font-medium">
                  {doc.id ? doc.id.substring(0, 8) : "N/A"}
                </TableCell>
                <TableCell>{doc.title || "Untitled Document"}</TableCell>
                <TableCell>
                  {doc.type || "Unknown"}
                  {doc.isAiClassified && (
                    <Badge
                      variant="outline"
                      className="ml-1 bg-blue-50 text-blue-700 text-xs"
                    >
                      AI
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      doc.processing_status === "classification_completed"
                        ? "bg-green-100 text-green-800"
                        : doc.processing_status === "error" 
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }
                  >
                    {doc.processing_status === "classification_completed" 
                      ? "Completed" 
                      : doc.processing_status === "error"
                        ? "Error"
                        : doc.processing_status || "Processing"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {doc.clauses && doc.clauses.length > 0 
                    ? doc.clauses.length > 3 
                      ? `${doc.clauses.slice(0, 3).join(", ")}...` 
                      : doc.clauses.join(", ")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
