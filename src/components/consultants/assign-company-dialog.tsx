"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useList } from "@refinedev/core";
import { useCompanyStore } from "@/store/useCompanyStore";

// Types for companies, certificates, and the consultant
interface Company {
  id: string;
  name: string;
  industry: string;
}

interface Certificate {
  id: string;
  name: string;
}

interface Consultant {
  name: string;
  email: string;
  // Companies already assigned to the consultant. Each entry may contain pre-assigned certificates.
  companies: Array<{ id: string; certificates?: string[] }>;
  // The certificates that the consultant is qualified for.
  certificates: string[];
}

interface AssignCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultant: Consultant;
  companies: Company[];
  certificates: Certificate[];
  onAssign: (companyId: string, certificateIds: string[]) => void;
}

// Define a Zod schema to validate the form.
const assignCompanySchema = z.object({
  companyId: z.string().min(1, { message: "Please select a company." }),
  certificateIds: z
    .array(z.string())
    .nonempty({ message: "Select at least one certificate." }),
});

type FormValues = z.infer<typeof assignCompanySchema>;

export function AssignCompanyDialog({
  open,
  onOpenChange,
  consultant,
  companies,
  onAssign,
}: AssignCompanyDialogProps) {
  console.log("Consultant : ", consultant);
  // Get the selected company from the sidebar
  const { selectedCompany } = useCompanyStore();

  // Initialize the form with React Hook Form and Zod as the resolver.
  const form = useForm<FormValues>({
    resolver: zodResolver(assignCompanySchema),
    defaultValues: {
      companyId: selectedCompany?.id || "",
      certificateIds: [],
    },
  });

  // Watch the selected company so we can fetch its certificates.
  const selectedCompanyId = form.watch("companyId");

  // Fetch certificates for the selected company from Supabase using refine.dev.
  // We filter the resource based on the selected company id (organization_id).
  const { data: companyCertsData, isLoading: isLoadingCompanyCerts } = useList({
    resource: "client_certifications",
    filters: selectedCompanyId
      ? [
          {
            field: "organization_id",
            operator: "eq",
            value: selectedCompanyId,
          },
        ]
      : [],
    meta: {
      select: "*, certificate:certificate_id(*)",
    },
    // The "enabled" option ensures the query only runs when a company is selected.
  });

  // Create an array of certificate IDs available for the selected company.
  const companyCertificateIds: string[] =
    (companyCertsData?.data as Array<{ certificate_id: string }>)?.map(
      (item) => item.certificate_id
    ) || [];

  // Reset the form when the dialog opens, pre-selecting the sidebar company.
  useEffect(() => {
    if (open) {
      form.reset({
        companyId: selectedCompany?.id || "",
        certificateIds: [],
      });
    }
  }, [open, form, selectedCompany]);

  // Handle form submission.
  const handleAssign = (data: FormValues) => {
    onAssign(data.companyId, data.certificateIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Company to Consultant</DialogTitle>
          <DialogDescription>
            Assign a company and specify which certificates the consultant will
            manage for this company.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Consultant information */}
          <div className="space-y-2">
            <Label htmlFor="consultant">Consultant</Label>
            <div className="p-2 border rounded-md bg-muted/30">
              <p className="font-medium">{consultant.name}</p>
              <p className="text-sm text-muted-foreground">
                {consultant.email}
              </p>
            </div>
          </div>

          {/* Build the form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAssign)}
              className="space-y-8"
            >
              {/* Company selection */}
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => {
                  // Always use the sidebar selected company
                  if (selectedCompany?.id && field.value !== selectedCompany.id) {
                    field.onChange(selectedCompany.id);
                  }
                  
                  return (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="p-2 border rounded-md bg-muted/30">
                            <p className="font-medium">
                              {companies.find(c => c.id === selectedCompany?.id)?.name || "No company selected"}
                            </p>
                          </div>

                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Certificate selection */}
              <FormField
                control={form.control}
                name="certificateIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificates</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedCompanyId ? (
                          isLoadingCompanyCerts ? (
                            <p>Loading available certificates...</p>
                          ) : (
                            <>
                              <div className="mb-3 pb-2 border-b">
                                <p className="text-sm font-medium">Available Certifications for this Company:</p>
                              </div>
                              {companyCertsData?.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No certifications available for this company.</p>
                              ) : (
                                // Filter the provided certificates to show only those:
                                // 1. The consultant is qualified for (consultant.certificates), and
                                // 2. The company actually has available (from Supabase).
                                companyCertsData?.data.map((certificate) => {
                                  // Ensure certificate.id is treated as a string
                                  const certId = String(certificate.id);
                                  const isChecked = field.value.includes(certId);
                                  return (
                                    <div
                                      key={certId}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`certificate-${certId}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([
                                              ...field.value,
                                              certId,
                                            ]);
                                          } else {
                                            field.onChange(
                                              field.value.filter(
                                                (id: string) =>
                                                  id !== certId
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`certificate-${certId}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {certificate.certificate.name}
                                      </Label>
                                    </div>
                                  );
                                })
                              )}
                            </>
                          )
                        ) : (
                          <p>Please select a company to load certificates.</p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {selectedCompanyId && companyCertsData?.data.length === 0 && (
                      <FormDescription>
                        This company has no certificates assigned. Please add
                        certificates to the company first.
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
