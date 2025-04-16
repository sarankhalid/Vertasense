"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface DocumentEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DocumentEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: DocumentEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
      <div className="flex flex-col items-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </div>
  );
}
