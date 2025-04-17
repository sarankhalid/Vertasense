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
import { certificateProvider } from "@/providers/certificate-provider";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { liveProvider } from "@/providers/live-provider";

interface CreateCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCertificateDialog({ open, onOpenChange }: CreateCertificateDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { certifications, fetchAllCertifications, fetchCertificates } = useCertificateStore();
  const [selectedCertificationId, setSelectedCertificationId] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  
  // Fetch all certifications when the component mounts
  React.useEffect(() => {
    fetchAllCertifications();
  }, [fetchAllCertifications]);

  // Reset the selected certification when the dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setSelectedCertificationId("");
    }
  }, [open]);

  const handleAddCertificate = async () => {
    if (!selectedCertificationId || !selectedCompany?.id) return;

    setIsCreating(true);
    try {
      // Find the selected certification from the list
      const selectedCertification = certifications.find(
        (cert: any) => cert.id === selectedCertificationId
      );

      if (!selectedCertification) {
        console.error("Selected certification not found");
        return;
      }

      // Create a relationship between the company and the certification
      const { data: clientCertificateData, error: clientCertificateError } = await supabaseBrowserClient
        .from("client_certifications")
        .insert([
          {
            organization_id: selectedCompany.id,
            certificate_id: selectedCertificationId,
          },
        ])
        .select();

      // First close the dialog before any further operations
      onOpenChange(false);
      
      if (clientCertificateError) {
        console.error("Error creating client certification:", clientCertificateError);
      } else {
        console.log("Certificate added successfully:", clientCertificateData);
        
        // Refresh the certificates list to show the newly added certificate
        if (selectedCompany?.id) {
          // Use setTimeout to delay the fetch until after the dialog is fully closed
          setTimeout(() => {
            fetchCertificates(selectedCompany.id);
          }, 100);
        }
        
        // Publish a live event for the new certificate
        // liveProvider.publish?.({
        //   channel: "client_certifications",
        //   type: "created",
        //   payload: {
        //     ids: [clientCertificateData[0].id],
        //   },
        //   date: new Date(),
        // });
      }
    } catch (err) {
      console.error("Failed to add certificate:", err);
      // Close the dialog even if there's an error
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  // If the dialog is not open, don't render anything
  if (!open) return null;
  
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Certificate</DialogTitle>
          <DialogDescription>
            Select a certificate to add to your compliance dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="certificate">Certificate</Label>
            <Select
              value={selectedCertificationId}
              onValueChange={setSelectedCertificationId}
            >
              <SelectTrigger id="certificate">
                <SelectValue placeholder="Select certificate" />
              </SelectTrigger>
              <SelectContent>
                {certifications.map((cert: any) => (
                  <SelectItem key={cert.id} value={cert.id}>
                    {cert.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCertificate} 
            disabled={!selectedCertificationId || isCreating}
          >
            {isCreating ? "Adding..." : "Add Certificate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
