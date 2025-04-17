"use client";

import type React from "react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Sidebar } from "@/components/sidebar";
import { OrganizationLoader } from "@/components/auth/organization-loader";
import { SelectionPersistence } from "@/components/auth/selection-persistence";

// This is the main layout component
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebarStore();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Load organizations when dashboard loads */}
      <OrganizationLoader />
      
      {/* Ensure selected company and certificate are persisted */}
      <SelectionPersistence />
      
      <Sidebar />
      <div 
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          collapsed ? "ml-[80px]" : "ml-[280px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
