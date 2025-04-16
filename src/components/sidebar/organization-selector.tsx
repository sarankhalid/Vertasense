"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { Organization } from "@/store/useAuthStore";

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const { organizations, selectedOrganization, setSelectedOrganization } =
    useAuthStore();
  const [open, setOpen] = React.useState(false);

  // If there's only one organization, don't show the selector
  if (organizations.length <= 1) {
    return null;
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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {selectedOrganization?.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="font-medium">
                  {selectedOrganization?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedOrganization?.role
                    ? `${selectedOrganization.role} Role`
                    : "Organization"}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[--radix-dropdown-menu-trigger-width]"
        >
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className={cn(
                "flex items-center justify-between py-2 px-3",
                selectedOrganization?.id === org.id &&
                  "bg-primary/10 border-l-4 border-primary"
              )}
              onSelect={() => {
                setSelectedOrganization(org);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground",
                    selectedOrganization?.id === org.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {org.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      selectedOrganization?.id === org.id && "font-medium"
                    )}
                  >
                    {org.name}
                  </span>
                  {org.role && (
                    <span className="text-xs text-muted-foreground">
                      {org.role}
                    </span>
                  )}
                </div>
              </div>
              {selectedOrganization?.id === org.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
