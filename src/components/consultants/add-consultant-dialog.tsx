// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";

// interface Certificate {
//   id: string;
//   name: string;
// }

// interface AddConsultantDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (consultant: any) => void;
//   certificates: Certificate[];
//   consultant?: any;
//   mode: "add" | "edit";
// }

// export function AddConsultantDialog({
//   open,
//   onOpenChange,
//   onSave,
//   certificates,
//   consultant,
//   mode = "add",
// }: AddConsultantDialogProps) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [specialization, setSpecialization] = useState("");
//   const [selectedCertificates, setSelectedCertificates] = useState<string[]>(
//     []
//   );

//   // Reset form when dialog opens or consultant changes
//   useEffect(() => {
//     if (consultant && mode === "edit") {
//       setName(consultant.name || "");
//       setEmail(consultant.email || "");
//       setPhone(consultant.phone || "");
//       setSpecialization(consultant.specialization || "");
//       setSelectedCertificates(consultant.certificates || []);
//     } else {
//       setName("");
//       setEmail("");
//       setPhone("");
//       setSpecialization("");
//       setSelectedCertificates([]);
//     }
//   }, [consultant, mode, open]);

//   const [isLoading, setIsLoading] = useState(false);

//   const createUserInSupabase = async (email: string) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('/api/create-user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           name,
//           role: 'CONSULTANT',
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create user account');
//       }

//       return data;
//     } catch (error) {
//       console.error('Error creating user:', error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     const newConsultant = {
//       name,
//       email,
//       phone,
//       specialization,
//       certificates: selectedCertificates,
//     };

//     try {
//       // Only create user in Supabase when adding a new consultant
//       if (mode === 'add') {
//         await createUserInSupabase(email);
//         alert('Consultant added and user account created successfully. A password reset email has been sent to the consultant\'s email address.');
//       }

//       onSave(newConsultant);
//       onOpenChange(false);
//     } catch (error) {
//       console.error('Error creating consultant:', error);
//       alert(error instanceof Error ? error.message : 'Failed to create consultant');
//       // Still allow saving the consultant in the UI even if the user creation fails
//       onSave(newConsultant);
//       onOpenChange(false);
//     }
//   };

//   const toggleCertificate = (certificateId: string) => {
//     setSelectedCertificates((prev) =>
//       prev.includes(certificateId)
//         ? prev.filter((id) => id !== certificateId)
//         : [...prev, certificateId]
//     );
//   };

//   const isFormValid =
//     name && email && phone && specialization && selectedCertificates.length > 0;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {mode === "add" ? "Add New Consultant" : "Edit Consultant"}
//           </DialogTitle>
//           <DialogDescription>
//             {mode === "add"
//               ? "Create a new consultant and assign certificates."
//               : "Update consultant information and certificates."}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               placeholder="Enter consultant name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Enter email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="phone">Phone</Label>
//             <Input
//               id="phone"
//               placeholder="Enter phone number"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="specialization">Specialization</Label>
//             <Input
//               id="specialization"
//               placeholder="Enter area of specialization"
//               value={specialization}
//               onChange={(e) => setSpecialization(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Certificates</Label>
//             <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
//               {certificates.map((certificate) => (
//                 <div
//                   key={certificate.id}
//                   className="flex items-center space-x-2"
//                 >
//                   <Checkbox
//                     id={`certificate-${certificate.id}`}
//                     checked={selectedCertificates.includes(certificate.id)}
//                     onCheckedChange={() => toggleCertificate(certificate.id)}
//                   />
//                   <Label
//                     htmlFor={`certificate-${certificate.id}`}
//                     className="text-sm font-normal cursor-pointer"
//                   >
//                     {certificate.name}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSave}
//             disabled={!isFormValid || isLoading}
//           >
//             {isLoading ? "Processing..." : mode === "add" ? "Add Consultant" : "Save Changes"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/useAuthStore";

interface Certificate {
  id: string;
  name: string;
}

interface AddConsultantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (consultant: any) => void;
  certificates: Certificate[];
  consultant?: any;
  mode: "add" | "edit";
}

// Define the form schema with Zod.
const consultantFormSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Please provide a valid email" }),
  phone: z.string().nonempty({ message: "Phone is required" }),
  // specialization: z
  //   .string()
  //   .nonempty({ message: "Specialization is required" }),
  // certificates: z
  //   .array(z.string())
  //   .min(1, { message: "Select at least one certificate" }),
});

type ConsultantFormValues = z.infer<typeof consultantFormSchema>;

export function AddConsultantDialog({
  open,
  onOpenChange,
  onSave,
  certificates,
  consultant,
  mode = "add",
}: AddConsultantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { selectedOrganization } = useAuthStore();

  // Initialize the form with default values (empty or based on the consultant prop).
  const form = useForm<ConsultantFormValues>({
    resolver: zodResolver(consultantFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      // specialization: "",
      // certificates: [],
    },
  });

  // Reset the form values when the dialog opens or when consultant prop is updated.
  useEffect(() => {
    if (consultant && mode === "edit") {
      form.reset({
        name: consultant.name || "",
        email: consultant.email || "",
        phone: consultant.phone || "",
        // specialization: consultant.specialization || "",
        // certificates: consultant.certificates || [],
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        // specialization: "",
        // certificates: [],
      });
    }
  }, [consultant, mode, open, form]);

  // Helper to call your Supabase API.
  // const createUserInSupabase = async (email: string) => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch("/api/create-user", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email,
  //         name: form.getValues("name"),
  //         role: "CONSULTANT",

  //       }),
  //     });
  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to create user account");
  //     }
  //     return data;
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const createUserInSupabase = async (data: ConsultantFormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "EMPLOYEE",
          organization_id: selectedOrganization?.id,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user account");
      }
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // The submit handler invoked by react-hook-form.
  const onSubmit = async (values: ConsultantFormValues) => {
    try {
      if (mode === "add") {
        await createUserInSupabase(values);
        alert(
          "Consultant added and user account created successfully. A password reset email has been sent to the consultant's email address."
        );
      }
      onSave(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating consultant:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create consultant"
      );
      // You can decide if you want to still call onSave even if user creation fails.
      onSave(values);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Consultant" : "Edit Consultant"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new consultant and assign certificates."
              : "Update consultant information and certificates."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter consultant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter area of specialization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name="certificates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificates</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                      {certificates.map((certificate) => {
                        const isChecked = field.value.includes(certificate.id);
                        const toggleCheckbox = () => {
                          if (isChecked) {
                            field.onChange(
                              field.value.filter(
                                (id: string) => id !== certificate.id
                              )
                            );
                          } else {
                            field.onChange([...field.value, certificate.id]);
                          }
                        };

                        return (
                          <div
                            key={certificate.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`certificate-${certificate.id}`}
                              checked={isChecked}
                              onCheckedChange={toggleCheckbox}
                            />
                            <Label
                              htmlFor={`certificate-${certificate.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {certificate.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : mode === "add"
                  ? "Add Consultant"
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
