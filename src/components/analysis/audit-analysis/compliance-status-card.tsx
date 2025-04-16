import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SectionStatus {
  id: string;
  title: string;
  implementationPercentage: number;
}

interface ComplianceStatusCardProps {
  sections: SectionStatus[];
}

export function ComplianceStatusCard({ sections }: ComplianceStatusCardProps) {
  const getIndicatorClassName = (percentage: number) => {
    return percentage >= 70
      ? "bg-green-500"
      : percentage >= 30
      ? "bg-amber-500"
      : "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Compliance Status</CardTitle>
        <CardDescription>Compliance by section</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sections.slice(0, 5).map((section) => (
            <div key={section.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{section.title}</span>
                <span className="text-sm font-medium">
                  {section.implementationPercentage}%
                </span>
              </div>
              <Progress
                value={section.implementationPercentage}
                className="h-2 bg-muted"
                indicatorClassName={getIndicatorClassName(
                  section.implementationPercentage
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
