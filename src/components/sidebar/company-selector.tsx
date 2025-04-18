"use client";

import * as React from "react";
import { ChevronsUpDown, PencilIcon, Plus, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@/components/ui/dialog";
import { CreateCompanyDialog } from "@/components/sidebar/create-company-dialog";
import { DeleteCompanyDialog } from "@/components/sidebar/delete-company-dialog";
import { EditCompanyDialog } from "@/components/sidebar/edit-company-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Company } from "@/providers/company-provider";
import { useCompanyStore } from "@/store/useCompanyStore";
import { CanAccess, useSubscription } from "@refinedev/core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { Skeleton } from "../ui/skeleton";

// Define the structure of the data returned from the org_users table
interface OrgUserData {
  id: string;
  organization_id: string;
  role_id: string;
  organizations: {
    id: string;
    name: string;
    type: string;
  };
  roles: {
    id: string;
    name: string;
  } | null;
}

interface CompanySelectorProps {
  className?: string;
}

export function CompanySelector({ className }: CompanySelectorProps) {
  const {
    companies,
    selectedCompany,
    setSelectedCompany,
    setCompanies,
    loadingCompanies,
    fetchCompanies,
  } = useCompanyStore();

  const { selectedOrganization } = useAuthStore();

  const [open, setOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // We'll remove the duplicate fetching logic from here since it's now handled by SelectionPersistence
  // This component will focus on rendering the UI and handling user interactions

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [companyToEdit, setCompanyToEdit] = React.useState<Company | null>(
    null
  );
  const [companyToDelete, setCompanyToDelete] = React.useState<Company | null>(
    null
  );

  const handleEditCompany = (company: Company) => {
    setCompanyToEdit(company);
    setEditDialogOpen(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  // While loading certificates, show a skeleton loader that matches the button dimensions
  if (loadingCompanies) {
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
    <div className={cn("w-full max-w-[280px]", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-2 h-auto py-2 px-3"
          >
            {selectedCompany ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-medium">{selectedCompany.name}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                {companies.length > 0
                  ? "Select Company"
                  : "No companies available"}
              </div>
            )}
            {/* <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {selectedCompany?.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="font-medium">{selectedCompany?.name}</span> */}
            {/* <span className="text-xs text-muted-foreground">
                  {selectedCompany?.id}
                </span> */}
            {/* </div>
            </div> */}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[--radix-dropdown-menu-trigger-width]"
        >
          {companies.map((company: Company) => (
            <DropdownMenuItem
              key={company.id}
              className={cn(
                "flex items-center justify-between py-2 px-3",
                selectedCompany?.id === company.id &&
                  "bg-primary/10 border-l-4 border-primary"
              )}
              onSelect={(e) => {
                // Prevent closing dropdown if clicking on action buttons
                if ((e.target as HTMLElement).closest(".company-action")) {
                  e.preventDefault();
                  return;
                }
                setSelectedCompany(company);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground",
                    selectedCompany?.id === company.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {company.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      selectedCompany?.id === company.id && "font-medium"
                    )}
                  >
                    {company.name}
                  </span>
                  {/* <span className="text-xs text-muted-foreground">
                    {company.id}
                  </span> */}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <CanAccess resource="organization" action="delete">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary hover:shadow-sm hover:scale-110 transition-all duration-200 company-action"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditCompany(company);
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit company</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Edit company</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CanAccess>

                <CanAccess resource="organization" action="delete">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-red-50 hover:bg-red-200 hover:text-red-600 hover:shadow-sm hover:scale-110 transition-all duration-200 company-action"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteCompany(company);
                          }}
                        >
                          <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                          <span className="sr-only">Delete company</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Delete company</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CanAccess>
              </div>
            </DropdownMenuItem>
          ))}
          <CreateCompanyDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
          <EditCompanyDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            companyToEdit={companyToEdit}
          />
          <DeleteCompanyDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            companyToDelete={companyToDelete}
          />
          <CanAccess resource="organization" action="create">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 mt-1 border-t pt-2"
              onClick={(e) => {
                e.preventDefault();
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add new company
            </Button>
          </CanAccess>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
