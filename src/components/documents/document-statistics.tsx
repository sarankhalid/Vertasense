"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, CheckCircle2, Clock } from "lucide-react";

interface DocumentStats {
  total: number;
  completed: number;
  processing: number;
  processed: number;
  byType?: {
    procedures: number;
    workInstructions: number;
    forms: number;
    manuals: number;
  };
}

interface DocumentStatisticsProps {
  stats: DocumentStats;
}

export function DocumentStatistics({ stats }: DocumentStatisticsProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">DOCUMENT STATISTICS</CardTitle>
        <CardDescription>
          Overview of document management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Total Documents
            </span>
            <div className="flex items-center mt-1">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Completed</span>
            <div className="flex items-center mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Processing</span>
            <div className="flex items-center mt-1">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{stats.processing}</span>
            </div>
          </div>

          {/* <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Processed</span>
            <div className="flex items-center mt-1">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{stats.processed}</span>
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
