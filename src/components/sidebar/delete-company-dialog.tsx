"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Company } from "@/providers/company-provider";
import { useCompanyStore } from "@/store/useCompanyStore";

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyToDelete: Company | null;
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyToDelete,
}: DeleteCompanyDialogProps) {
  const { companies, selectedCompany, setSelectedCompany, deleteCompany } = useCompanyStore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    setIsDeleting(true);
    try {
      const { success, error } = await deleteCompany(companyToDelete.id);
      
      if (error) {
        console.error("Error deleting company:", error);
      } else if (success) {
        // If we're deleting the currently selected company, select another one if available
        if (selectedCompany?.id === companyToDelete.id) {
          const remainingCompanies = companies.filter(c => c.id !== companyToDelete.id);
          if (remainingCompanies.length > 0) {
            setSelectedCompany(remainingCompanies[0]);
          } else {
            setSelectedCompany(null);
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete company:", err);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {companyToDelete?.name}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteCompany}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
