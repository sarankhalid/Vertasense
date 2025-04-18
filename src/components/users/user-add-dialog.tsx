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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useCertificateStore } from "@/store/useCertificateStore";

interface UserUI {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization?: string;
  status: string;
  lastLogin?: string;
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: any) => void;
  user?: UserUI;
  mode: "add" | "edit";
}

// Define the form schema with Zod
const userFormSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Please provide a valid email" }),
  phone: z.string().optional(),
  role: z.string().default("USER"),
  status: z.string().default("Active"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function AddUserDialog({
  open,
  onOpenChange,
  onSave,
  user,
  mode = "add",
}: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedOrganization } = useAuthStore();
  const { selectedCompany } = useCompanyStore();
  const { selectedCertificate } = useCertificateStore();

  // Initialize the form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "USER",
      status: "Active",
    },
  });

  // Reset the form values when the dialog opens or when user prop is updated
  useEffect(() => {
    if (user && mode === "edit") {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "USER",
        status: user.status || "Active",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        role: "USER",
        status: "Active",
      });
    }
  }, [user, mode, open, form]);

  // Helper to call your API
  const createUserInSystem = async (data: UserFormValues) => {
    try {
      setIsLoading(true);
      
      // Ensure we have all required IDs
      if (!selectedOrganization?.id) {
        throw new Error("Organization ID is required");
      }
      
      if (!selectedCompany?.id) {
        throw new Error("Company ID is required");
      }
      
      if (!selectedCertificate?.id) {
        throw new Error("Certificate ID is required");
      }
      
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "USER",
          organization_id: selectedOrganization.id,
          company_id: selectedCompany.id,
          client_certification_id: selectedCertificate.id,
        }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user account");
      }
      
      console.log("User created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // The submit handler invoked by react-hook-form
  const onSubmit = async (values: UserFormValues) => {
    try {
      if (mode === "add") {
        await createUserInSystem(values);
        alert(
          "User added successfully. A password reset email has been sent to the user's email address."
        );
      }
      onSave(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new user account in the system."
              : "Update user information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user name" {...field} />
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

            {/* <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : mode === "add"
                  ? "Add User"
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
