"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader, Plus } from "lucide-react";
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
import { Skeleton } from "../ui/skeleton";

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

  // While loading certificates, show a disabled button with a loading message.
  // if (loadingCertificates) {
  //   return (
  //     <div className={cn("w-full max-w-[280px]", className)}>
  //       <Button
  //         variant="outline"
  //         className="w-full border-2 h-auto py-2 px-3"
  //         disabled
  //       >
  //         {/* Loading certificates... */}
  //         <Loader className="animate-spin text-black h-12 w-12" />
  //       </Button>
  //     </div>
  //   );
  // }

  // While loading certificates, show a skeleton loader that matches the button dimensions
  if (loadingCertificates) {
    return (
      <div className={cn("w-full max-w-[280px]", className)}>
        <div className="w-full border-2 rounded-md h-[41px] py-2 px-3 flex items-center justify-between">
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
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
      <CreateCertificateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
