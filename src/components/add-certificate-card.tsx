"use client";

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AddCertificateCardProps {
  onClick: () => void;
}

export function AddCertificateCard({ onClick }: AddCertificateCardProps) {
  return (
    <Card
      className="w-full max-w-[300px] border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px] p-5">
        <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-3">
          <Plus className="h-5 w-5 text-muted-foreground/70" />
        </div>
        <p className="text-muted-foreground font-medium">Add Certificate</p>
      </CardContent>
    </Card>
  );
}
