"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  Layers,
  Shield,
  Users,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthInfo } from "@/hooks/use-auth-info";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  children?: NavItem[];
};

// Define the base navigation items
const getNavItems = (): NavItem[] => [
  // {
  //   icon: <Home className="w-5 h-5" />,
  //   label: "Dashboard",
  //   href: "/dashboard",
  // },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Documents",
    href: "/dashboard/documents",
  },
  {
    icon: <PieChart className="w-5 h-5" />,
    label: "Analysis",
    href: "/dashboard/analysis",
  },
  // {
  //   icon: <Layers className="w-5 h-5" />,
  //   label: "Frameworks",
  //   href: "/frameworks",
  //   children: [
  //     {
  //       icon: <FileText className="w-4 h-4" />,
  //       label: "ISO 9001",
  //       href: "/frameworks/iso-9001",
  //     },
  //     {
  //       icon: <FileText className="w-4 h-4" />,
  //       label: "ISO 27001",
  //       href: "/frameworks/iso-27001",
  //     },
  //     {
  //       icon: <FileText className="w-4 h-4" />,
  //       label: "GDPR",
  //       href: "/frameworks/gdpr",
  //     },
  //   ],
  // },
  // {
  //   icon: <BarChart3 className="w-5 h-5" />,
  //   label: "Reports",
  //   href: "/reports",
  // },
  // {
  //   icon: <Calendar className="w-5 h-5" />,
  //   label: "Calendar",
  //   href: "/calendar",
  // },
  // {
  //   icon: <FileText className="w-5 h-5" />,
  //   label: "Templates",
  //   href: "/templates",
  // },
  // {
  //   icon: <Users className="w-5 h-5" />,
  //   label: "Trainings",
  //   href: "/trainings",
  // },
  // {
  //   icon: <Shield className="w-5 h-5" />,
  //   label: "Risk assessment",
  //   href: "/risk-assessment",
  // },
];

// Consultants nav item - only shown to CONSULTING_FIR_ADMIN
const consultantsNavItem: NavItem = {
  icon: <Users className="w-5 h-5" />,
  label: "Consultants",
  href: "/dashboard/consultants",
};

interface NavMenuProps {
  className?: string;
}

export function NavMenu({ className }: NavMenuProps) {
  const { collapsed, openGroups, toggleGroup } = useSidebarStore();
  const pathname = usePathname();
  const { hasRole } = useAuthInfo();
  
  // Get base nav items
  const baseNavItems = getNavItems();
  
  // Add Consultants tab only for CONSULTING_FIR_ADMIN role
  const mainNavItems = React.useMemo(() => {
    const items = [...baseNavItems];
    
    // Only add the Consultants tab if the user has the CONSULTING_FIR_ADMIN role
    if (hasRole("CONSULTING_FIR_ADMIN")) {
      items.push(consultantsNavItem);
    }
    
    return items;
  }, [hasRole]);

  // Function to check if a nav item is active based on the current path
  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    // For other routes, check if the pathname starts with the href (for nested routes)
    return href !== "/dashboard" && pathname.startsWith(href);
  };

  return (
    <nav className={cn("flex-1 overflow-y-auto py-4", className)}>
      <ul className="space-y-1 px-2">
        {mainNavItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.children ? (
              <Collapsible
                open={openGroups[item.label]}
                onOpenChange={() => toggleGroup(item.label)}
                className={collapsed ? "hidden" : ""}
              >
                <CollapsibleTrigger asChild>
                  <li>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between font-normal",
                        isActive(item.href) && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openGroups[item.label] && "rotate-180"
                        )}
                      />
                    </Button>
                  </li>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 space-y-1 pl-9">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal",
                            isActive(child.href) && "bg-muted"
                          )}
                          asChild
                        >
                          <Link
                            href={child.href}
                            className="flex items-center gap-3"
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <li>
                {collapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "w-full h-10",
                            isActive(item.href) && "bg-muted"
                          )}
                          asChild
                        >
                          <Link href={item.href}>{item.icon}</Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      isActive(item.href) && "bg-muted"
                    )}
                    asChild
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                )}
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
}
