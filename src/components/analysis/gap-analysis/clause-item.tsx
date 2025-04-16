import { ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Clause, ClauseStatus } from "@/types/analysis-types"
import { ClauseDetail } from "./clause-detail"

interface ClauseItemProps {
  clause: Clause
  isExpanded: boolean
  onToggle: () => void
}

export function ClauseItem({ clause, isExpanded, onToggle }: ClauseItemProps) {
  // Get status badge for a clause
  const getStatusBadge = (status: ClauseStatus) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500 hover:bg-green-600">Compliant</Badge>
      case "partial":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Partially Compliant</Badge>
      case "non-compliant":
        return <Badge className="bg-red-500 hover:bg-red-600">Non-Compliant</Badge>
      case "not-applicable":
        return <Badge variant="outline">Not Applicable</Badge>
    }
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full text-left">
        <div className="flex items-center justify-between py-3 cursor-pointer">
          <div className="flex items-center gap-4">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {clause.number} - {clause.title}
                </span>
                {getStatusBadge(clause.status)}
                {clause.nonConformities && clause.nonConformities.items && clause.nonConformities.items.length > 0 && (
                  <Badge variant="outline" className="text-red-500 border-red-200">
                    {clause.nonConformities.items.length} Issue
                    {clause.nonConformities.items.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{clause.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-medium">{clause.implementationPercentage}%</span>
            </div>
            <Progress
              value={clause.implementationPercentage}
              className="w-24 h-2"
              indicatorClassName={cn(
                clause.implementationPercentage >= 70
                  ? "bg-green-500"
                  : clause.implementationPercentage >= 30
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ClauseDetail clause={clause} />
      </CollapsibleContent>
    </Collapsible>
  )
}
