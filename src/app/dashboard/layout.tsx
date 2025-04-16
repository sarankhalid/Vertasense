"use client";

import type React from "react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Sidebar } from "@/components/sidebar";

// This is the main layout component
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebarStore();
  
  return (
    <div className="flex h-screen bg-gray-50">
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
