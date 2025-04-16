"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type ClauseStatus = "compliant" | "non-compliant" | "partial" | "not-applicable"

interface Clause {
  id: string
  number: string
  title: string
  description: string
  status: ClauseStatus
  implementationPercentage: number
  evidence?: string[]
  findings?: string
}

interface ClauseSection {
  id: string
  title: string
  clauses: Clause[]
  implementationPercentage: number
}

interface AuditFindingsDetailProps {
  sections: ClauseSection[]
  searchTerm: string
}

export function AuditFindingsDetail({ sections, searchTerm }: AuditFindingsDetailProps) {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})
  const [expandedClauses, setExpandedClauses] = React.useState<Record<string, boolean>>({})

  // Filter clauses based on search term
  const filteredSections = React.useMemo(() => {
    if (!searchTerm) return sections

    return sections
      .map((section) => ({
        ...section,
        clauses: section.clauses.filter(
          (clause) =>
            clause.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter((section) => section.clauses.length > 0)
  }, [searchTerm, sections])

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Toggle clause expansion
  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }))
  }

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Audit Findings</CardTitle>
        <CardDescription>Detailed analysis of the latest audit results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSections[section.id]}
              onOpenChange={() => toggleSection(section.id)}
            >
              <div className="border rounded-md">
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      {expandedSections[section.id] ? (
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
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t px-4 py-2 divide-y">
                    {section.clauses.map((clause) => (
                      <Collapsible
                        key={clause.id}
                        open={expandedClauses[clause.id]}
                        onOpenChange={() => toggleClause(clause.id)}
                      >
                        <CollapsibleTrigger className="w-full text-left">
                          <div className="flex items-center justify-between py-3 cursor-pointer">
                            <div className="flex items-center gap-2">
                              {expandedClauses[clause.id] ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">
                                {clause.number} - {clause.title}
                              </span>
                              {getStatusBadge(clause.status)}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pr-4 pb-4">
                            <p className="text-sm mb-3">{clause.description}</p>

                            <div className="bg-muted/50 p-3 rounded-md">
                              <h4 className="text-sm font-medium mb-2">Audit Evidence</h4>
                              <p className="text-sm text-muted-foreground">
                                {clause.evidence && clause.evidence.length > 0
                                  ? `Reviewed ${clause.evidence.join(", ")}`
                                  : "No evidence was available for review"}
                              </p>

                              <h4 className="text-sm font-medium mt-3 mb-2">Auditor Notes</h4>
                              <p className="text-sm text-muted-foreground">
                                {clause.findings &&
                                clause.findings !== "[No data]" &&
                                clause.findings !==
                                  "[Provide audit evaluation based on the documentation and gap analysis]"
                                  ? clause.findings
                                  : clause.status === "compliant"
                                    ? "The organization has demonstrated compliance with this requirement. Documentation is complete and implementation is effective."
                                    : clause.status === "partial"
                                      ? "The organization has partially implemented this requirement. Some documentation exists but implementation is inconsistent."
                                      : "The organization has not demonstrated compliance with this requirement. No documentation or implementation was observed."}
                              </p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
