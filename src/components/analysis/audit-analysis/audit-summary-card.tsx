import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuditSummaryCardProps {
  auditDate: string;
  auditor: string;
  auditType: string;
  standard: string;
  overallResult: "pass" | "conditional-pass" | "fail";
}

export function AuditSummaryCard({
  auditDate = new Date().toLocaleDateString(),
  auditor = "ISO Compliance Team",
  auditType = "Internal",
  standard = "ISO 27001",
  overallResult = "conditional-pass",
}: AuditSummaryCardProps) {
  const getResultBadge = () => {
    switch (overallResult) {
      case "pass":
        return <Badge className="bg-green-500 hover:bg-green-600">Pass</Badge>;
      case "conditional-pass":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            Conditional Pass
          </Badge>
        );
      case "fail":
        return <Badge className="bg-red-500 hover:bg-red-600">Fail</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Audit Summary</CardTitle>
        <CardDescription>Latest audit results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Audit Date</span>
            <span className="font-medium">{auditDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Auditor</span>
            <span className="font-medium">{auditor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Audit Type</span>
            <span className="font-medium">{auditType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Standard</span>
            <span className="font-medium">{standard}</span>
          </div>
          <div className="pt-2 mt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Result</span>
              {getResultBadge()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
