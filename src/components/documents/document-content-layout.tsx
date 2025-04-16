"use client";

import { ReactNode } from "react";

interface DocumentContentLayoutProps {
  tableSection: ReactNode;
  detailsSection: ReactNode;
}

export function DocumentContentLayout({
  tableSection,
  detailsSection,
}: DocumentContentLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Document Table Section */}
      <div className="lg:col-span-2">
        {tableSection}
      </div>

      {/* Document Details Section */}
      <div className="lg:col-span-1">
        {detailsSection}
      </div>
    </div>
  );
}
