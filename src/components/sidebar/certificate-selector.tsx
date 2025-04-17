"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { CreateCertificateDialog } from "@/components/sidebar/create-certificate-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";

// Define the structure of the certificate data returned from the API
// In this case, each certificate has a nested "certifications" field containing details.
interface CertificateSelectorProps {
  className?: string;
}

export function CertificateSelector({ className }: CertificateSelectorProps) {
  const { selectedCompany } = useCompanyStore();
  const {
    certificates,
    selectedCertificate,
    setSelectedCertificate,
    fetchCertificates,
    loadingCertificates,
  } = useCertificateStore();

  console.log("Certificates : ", certificates);

  const selectedCertificateId = selectedCertificate?.id || null;
  const selectedCompanyId = selectedCompany?.id || null;

  // Local state for controlling the dropdown and add-certificate dialog
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Track the last company ID to detect changes
  const [lastCompanyId, setLastCompanyId] = React.useState<string | null>(null);
  
  // Use a ref to track if we've already fetched certificates for this company
  const fetchedForCompanyRef = React.useRef<string | null>(null);

  // When the selected company changes, fetch its certificates
  // We don't reset the selected certificate anymore
  // This prevents the selected certificate from changing when the page reloads
  React.useEffect(() => {
    // Skip if no company is selected or if we're already loading
    if (!selectedCompanyId || loadingCertificates) {
      return;
    }
    
    // Company has changed
    if (selectedCompanyId !== lastCompanyId) {
      console.log("Company changed, fetching certificates for new company");
      fetchedForCompanyRef.current = selectedCompanyId;
      fetchCertificates(selectedCompanyId);
      setLastCompanyId(selectedCompanyId);
      
      // Reset selected certificate when company changes
      setSelectedCertificate(null);
      return;
    }
    
    // If we haven't fetched for this company yet and we're not loading
    if (fetchedForCompanyRef.current !== selectedCompanyId && !loadingCertificates) {
      console.log("First time fetching for this company");
      fetchedForCompanyRef.current = selectedCompanyId;
      fetchCertificates(selectedCompanyId);
    }
  }, [
    selectedCompanyId,
    fetchCertificates,
    loadingCertificates,
    lastCompanyId,
    setSelectedCertificate
  ]);

  // Add an effect to ensure the selected certificate belongs to the current company
  React.useEffect(() => {
    // If there are no certificates or the selected certificate doesn't match any of them,
    // reset the selected certificate
    if (
      !loadingCertificates && 
      certificates.length === 0 && 
      selectedCertificate !== null
    ) {
      console.log("No certificates available for this company, resetting selected certificate");
      setSelectedCertificate(null);
    } else if (
      !loadingCertificates &&
      certificates.length > 0 &&
      selectedCertificate &&
      !certificates.some(cert => cert.id === selectedCertificate.id)
    ) {
      console.log("Selected certificate doesn't belong to this company, resetting");
      setSelectedCertificate(null);
    }
  }, [certificates, selectedCertificate, loadingCertificates, setSelectedCertificate]);

  // While loading certificates, show a disabled button with a loading message.
  if (loadingCertificates) {
    return (
      <div className={cn("w-full max-w-[280px]", className)}>
        <Button
          variant="outline"
          className="w-full justify-between border-2 h-auto py-2 px-3"
          disabled
        >
          Loading certificates...
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={cn("w-full max-w-[280px]", className)}>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-2 h-auto py-2 px-3"
            >
              {selectedCertificate ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-medium">
                      {selectedCertificate.certifications?.standard}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {certificates.length > 0
                    ? "Select Certificate"
                    : "No certificates available"}
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width]"
          >
            {certificates.length > 0 ? (
              <>
                {certificates.map((certificate: any) => (
                  <DropdownMenuItem
                    key={certificate.id}
                    className={cn(
                      "flex items-center justify-between py-2",
                      selectedCertificateId === certificate.id && "bg-accent"
                    )}
                    onSelect={() => {
                      setSelectedCertificate(certificate);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {certificate.certifications.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span>{certificate.certifications.standard}</span>
                      </div>
                    </div>
                    {selectedCertificateId === certificate.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No certificates found for this company
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 mt-1 border-t pt-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add new certificate
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Render the dialog outside of the dropdown to prevent duplicate rendering */}
      <CreateCertificateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
