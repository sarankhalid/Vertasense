"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";

type FooterNavItem = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isButton?: boolean;
};

interface FooterMenuProps {
  className?: string;
}

export function FooterMenu({ className }: FooterMenuProps) {
  const { collapsed } = useSidebarStore();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      // Clear the auth store
      clearAuth();
      
      // Sign out from Supabase
      await supabaseBrowserClient.auth.signOut();
      
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const footerNavItems: FooterNavItem[] = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/settings",
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: "Logout",
      isButton: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className={cn("p-4", className)}>
      <ul className="space-y-1">
        {footerNavItems.map((item) => (
          <li key={item.label}>
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {item.isButton ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-10"
                        onClick={item.onClick}
                      >
                        {item.icon}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-10"
                        asChild
                      >
                        <Link href={item.href!}>{item.icon}</Link>
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              item.isButton ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={item.onClick}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link href={item.href!} className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
