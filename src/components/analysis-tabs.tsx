"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Info,
  Search,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditAnalysis } from "./analysis/audit-analysis/audit-analysis";
import { useCertificateStore } from "@/store/useCertificateStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { GapAnalysis } from "./analysis/gap-analysis/gap-analysis";

export function AnalysisTabs() {
  return (
    <Tabs defaultValue="gap-analysis" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="audit-analysis">Audit Analysis</TabsTrigger>
        </TabsList>
        {/* <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clauses..."
            className="w-[250px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
      </div>

      <TabsContent value="gap-analysis" className="mt-0">
        <GapAnalysis />
      </TabsContent>

      <TabsContent value="audit-analysis" className="mt-0">
        <AuditAnalysis />
      </TabsContent>
    </Tabs>
  );
}
