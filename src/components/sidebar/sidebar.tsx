"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CompanySelector } from "./company-selector";
import { CertificateSelector } from "./certificate-selector";
import { OrganizationSelector } from "./organization-selector";
import { NavMenu } from "./nav-menu";
import { FooterMenu } from "./footer-menu";
import { CollapseToggle } from "./collapse-toggle";
import { useSidebarStore } from "@/store/useSidebarStore";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r transition-all duration-300 ease-in-out fixed top-0 left-0 z-40",
        collapsed ? "w-[80px]" : "w-[280px]",
        className
      )}
    >
      <div className="p-4 space-y-4">
        {collapsed ? (
          <CollapseToggle />
        ) : (
          <>
            <OrganizationSelector className="w-full max-w-none" />
            <CompanySelector className="w-full max-w-none" />
            <CertificateSelector className="w-full max-w-none" />
          </>
        )}
      </div>

      <Separator />

      <NavMenu />

      <Separator />

      <FooterMenu />
    </div>
  );
}
