import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import type { Clause, GapStatus, NonConformityType } from "@/types/analysis-types"

interface ClauseDetailProps {
  clause: any;
}

export function ClauseDetail({ clause }: ClauseDetailProps) {
  // Get status badge for a gap
  const getGapStatusBadge = (status: any) => {
    switch (status) {
      case "closed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Closed</Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>
        );
      case "open":
        return <Badge className="bg-red-500 hover:bg-red-600">Open</Badge>;
    }
  };

  // Get non-conformity type badge
  const getNonConformityTypeBadge = (type: any) => {
    switch (type) {
      case "major":
        return <Badge className="bg-red-500 hover:bg-red-600">Major</Badge>;
      case "minor":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Minor</Badge>;
      case "observation":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Observation</Badge>
        );
    }
  };

  return (
    <div className="pl-8 pr-4 pb-4 space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Description</h4>
        <p className="text-sm">{clause.description}</p>
      </div>

      {clause.findings && clause.findings !== "[No data]" && (
        <div>
          <h4 className="text-sm font-medium mb-1">Findings</h4>
          <p className="text-sm">{clause.findings}</p>
        </div>
      )}

      {clause.evidence && clause.evidence.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium mb-1">Evidence Files</h4>
          <div className="space-y-1">
            {clause.evidence.map((evidence: any, index: any) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{evidence}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium mb-1">Evidence Files</h4>
          <p className="text-sm text-muted-foreground">
            No evidence files provided
          </p>
        </div>
      )}

      {clause.nonConformities &&
      clause.nonConformities.items &&
      clause.nonConformities.items.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium mb-2">Non-Conformities</h4>
          <div className="space-y-3">
            {clause.nonConformities.items.map((nc: any, index: any) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {clause.conformityStatus?.includes("Major")
                      ? getNonConformityTypeBadge("major")
                      : getNonConformityTypeBadge("minor")}
                    <span className="font-medium">{nc.nature}</span>
                  </div>
                  {clause.gapClosureStatus &&
                    getGapStatusBadge(clause.gapClosureStatus)}
                </div>

                {clause.nonConformities.rootCause &&
                  clause.nonConformities.rootCause !==
                    "[Root cause analysis]" &&
                  clause.nonConformities.rootCause !== "[No data]" && (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">
                        Root Cause
                      </h5>
                      <p className="text-sm">
                        {clause.nonConformities.rootCause}
                      </p>
                    </div>
                  )}

                {clause.nonConformities.correctiveActionRecommendations &&
                  clause.nonConformities.correctiveActionRecommendations !==
                    "[Corrective actions]" &&
                  clause.nonConformities.correctiveActionRecommendations !==
                    "[No data]" && (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">
                        Corrective Action
                      </h5>
                      <p className="text-sm">
                        {clause.nonConformities.correctiveActionRecommendations}
                      </p>
                    </div>
                  )}

                {clause.nonConformities.timelineForCorrection &&
                  clause.nonConformities.timelineForCorrection !==
                    "[Suggested timeline for corrective action]" &&
                  clause.nonConformities.timelineForCorrection !==
                    "[No data]" && (
                    <div className="text-xs text-muted-foreground">
                      Due date: {clause.nonConformities.timelineForCorrection}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium mb-1">Non-Conformities</h4>
          <p className="text-sm text-muted-foreground">
            No non-conformities identified
          </p>
        </div>
      )}

      {/* "View Full Details" button removed as per requirements */}
    </div>
  );
}
