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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";
import { Certification } from "@/types/certification";
import { liveProvider } from "@/providers/live-provider";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  const { createCompany, setSelectedCompany } = useCompanyStore();
  const { certifications, fetchAllCertifications, loadingCertifications } =
    useCertificateStore();

  const [newCompanyName, setNewCompanyName] = React.useState("");
  const [selectedCertificationId, setSelectedCertificationId] =
    React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Fetch certifications when the dialog opens
  React.useEffect(() => {
    if (open) {
      fetchAllCertifications();
    }
  }, [open, fetchAllCertifications]);

  const handleAddCompany = async () => {
    if (newCompanyName.trim()) {
      setIsCreating(true);
      try {
        // Create the company using the context function
        const { data, error } = await createCompany({
          name: newCompanyName.trim(),
        });

        if (error) {
          console.error("Error creating company:", error);
        } else if (data) {
          // Set the new company as selected
          setSelectedCompany(data);

          // If a certification was selected, associate it with the company
          if (selectedCertificationId) {
            // Here you would add code to associate the certification with the company
            console.log("Selected certification ID:", selectedCertificationId);

            // Publish a live event for the company-certification association
            liveProvider.publish?.({
              channel: "company_certifications",
              type: "created",
              payload: {
                companyId: data.id,
                certificationId: selectedCertificationId,
              },
              date: new Date(),
            });
          }
        }
      } catch (err) {
        console.error("Failed to create company:", err);
      } finally {
        setIsCreating(false);
        setNewCompanyName("");
        setSelectedCertificationId("");
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new company</DialogTitle>
          <DialogDescription>
            Create a new company to manage in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="certification">
              Select Certification (Optional)
            </Label>
            <Select
              value={selectedCertificationId}
              onValueChange={setSelectedCertificationId}
              disabled={loadingCertifications}
            >
              <SelectTrigger id="certification">
                <SelectValue
                  placeholder={
                    loadingCertifications
                      ? "Loading certifications..."
                      : "Select certification"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {certifications.map((certification: Certification) => (
                  <SelectItem key={certification.id} value={certification.id}>
                    {certification.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setNewCompanyName("");
              setSelectedCertificationId("");
              onOpenChange(false);
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCompany}
            disabled={!newCompanyName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Add company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
