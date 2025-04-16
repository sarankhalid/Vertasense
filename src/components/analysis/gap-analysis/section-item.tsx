"use client"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { ClauseSection } from "@/types/analysis-types"
import { ClauseItem } from "./clause-item"

interface SectionItemProps {
  section: ClauseSection
  expandedClauses: Record<string, boolean>
  isExpanded: boolean
  onToggleSection: () => void
  onToggleClause: (clauseId: string) => void
}

export function SectionItem({
  section,
  expandedClauses,
  isExpanded,
  onToggleSection,
  onToggleClause,
}: SectionItemProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleSection}>
      <div className="border rounded-md">
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-4">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.clauses.length} clause
                  {section.clauses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-medium">{section.implementationPercentage}%</span>
                <p className="text-sm text-muted-foreground">Implementation</p>
              </div>
              <Progress
                value={section.implementationPercentage}
                className="w-24 h-2"
                indicatorClassName={cn(
                  section.implementationPercentage >= 70
                    ? "bg-green-500"
                    : section.implementationPercentage >= 30
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 py-2 divide-y">
            {section.clauses.map((clause) => (
              <ClauseItem
                key={clause.id}
                clause={clause}
                isExpanded={!!expandedClauses[clause.id]}
                onToggle={() => onToggleClause(clause.id)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
