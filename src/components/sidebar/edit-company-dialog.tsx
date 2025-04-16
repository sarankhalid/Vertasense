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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Company } from "@/providers/company-provider";
import { useCompanyStore } from "@/store/useCompanyStore";

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyToEdit: Company | null;
}

export function EditCompanyDialog({
  open,
  onOpenChange,
  companyToEdit,
}: EditCompanyDialogProps) {
  const { updateCompany, selectedCompany, setSelectedCompany } = useCompanyStore();
  const [companyName, setCompanyName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Set the company name when the dialog opens or the company to edit changes
  React.useEffect(() => {
    if (companyToEdit) {
      setCompanyName(companyToEdit.name);
    }
  }, [companyToEdit]);

  const handleUpdateCompany = async () => {
    if (!companyToEdit || !companyName.trim()) return;
    
    setIsUpdating(true);
    try {
      const { data, error } = await updateCompany(companyToEdit.id, {
        name: companyName.trim(),
      });
      
      if (error) {
        console.error("Error updating company:", error);
      } else if (data) {
        // If we're updating the currently selected company, update the selected company state
        if (selectedCompany?.id === companyToEdit.id) {
          setSelectedCompany(data);
        }
      }
    } catch (err) {
      console.error("Failed to update company:", err);
    } finally {
      setIsUpdating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setCompanyName("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit company</DialogTitle>
          <DialogDescription>
            Update the company information in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCompanyName("");
              onOpenChange(false);
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCompany}
            disabled={!companyName.trim() || isUpdating || companyName === companyToEdit?.name}
          >
            {isUpdating ? "Updating..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
