"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/useSidebarStore";

interface CollapseToggleProps {
  className?: string;
}

export function CollapseToggle({ className }: CollapseToggleProps) {
  const { collapsed, setCollapsed } = useSidebarStore();

  return (
    <div className={cn("p-2", className)}>
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-full h-10"
                onClick={() => setCollapsed(false)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="w-full h-10"
          onClick={() => setCollapsed(true)}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
