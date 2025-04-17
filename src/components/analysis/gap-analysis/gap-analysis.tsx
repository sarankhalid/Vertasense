"use client";

import * as React from "react";
import { Loader, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCertificateStore } from "@/store/useCertificateStore";
import { toast } from "sonner";
import { GapStatusCard } from "./dashboard-cards/gap-status-card";
import { NonConformitiesCard } from "./dashboard-cards/non-conformities-card";
import { OverallImplementationCard } from "./dashboard-cards/overall-implementation-card";
import { SectionItem } from "./section-item";
import { NoDataFallback } from "./no-data-fallback";
import {
  useCreate,
  useList,
  useSubscription,
  useUpdate,
} from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";

interface GapAnalysisRecord {
  id: string;
  client_certificate_id: string;
  status: string;
  gap_analysis?: {
    data?: any[];
    versions?: Array<{
      data: any[];
    }>;
  };
}

export function GapAnalysis() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});
  const [expandedClauses, setExpandedClauses] = React.useState<
    Record<string, boolean>
  >({});
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { selectedCertificate } = useCertificateStore();
  const [gapData, setGapData] = React.useState<any[]>([]);
  const [analysisStatus, setAnalysisStatus] = React.useState<string | null>(
    null
  );

  /**
   * 1. Fetch the gap-analysis record for the current certificate (if any).
   *    - We limit to 1 result, because we expect at most one record per certificate.
   */
  const {
    data: gapAnalysisResponse,
    isLoading: isGapAnalysisLoading,
    isError: isGapAnalysisError,
    error: gapAnalysisError,
    refetch,
  } = useList<GapAnalysisRecord>({
    resource: "gap_analysis",
    filters: [
      {
        field: "client_certificate_id",
        operator: "eq",
        value: selectedCertificate?.id,
      },
    ],
    pagination: {
      pageSize: 1,
      current: 1,
    },
    queryOptions: {
      // Only fetch if we have a valid certificate ID
      enabled: !!selectedCertificate?.id,
      onError: (err) => {
        // Log and/or toast on error
        console.error("Error fetching gap analysis:", err);
      },
    },
  });

  /**
   * 2. Extract the single gap-analysis record from the returned list (if any),
   *    and put its "gap_analysis.versions[0].data" into local state (gapData).
   *    Also extract the status to determine if analysis is in progress.
   */
  React.useEffect(() => {
    if (!gapAnalysisResponse || gapAnalysisResponse.data.length === 0) {
      // No existing gap analysis for this certificate
      setGapData([]);
      setAnalysisStatus(null);
      return;
    }

    const record = gapAnalysisResponse.data[0];

    // Set the analysis status
    setAnalysisStatus(record.status);

    // We expect record.gap_analysis.versions[0].data
    if (record?.gap_analysis?.versions) {
      setGapData(record.gap_analysis.versions[0].data || []);
    } else if (record?.gap_analysis?.data) {
      setGapData(record.gap_analysis.data || []);
    } else {
      setGapData([]);
    }
  }, [gapAnalysisResponse]);

  /**
   * 3. Create and update hooks for gap_analysis resource.
   */
  const { mutate: createGapAnalysis } = useCreate();
  const { mutate: updateGapAnalysis } = useUpdate();

  // Helper function to get section titles
  function getSectionTitle(sectionNumber: string): string {
    const titles: Record<string, string> = {
      "1": "Scope",
      "2": "Normative references",
      "3": "Terms and definitions",
      "4": "Context of the organization",
      "5": "Leadership",
      "6": "Planning",
      "7": "Support",
      "8": "Operation",
      "9": "Performance evaluation",
      "10": "Improvement",
    };
    return titles[sectionNumber] || `Section ${sectionNumber}`;
  }

  // Transform the gap data into our component's data structure
  const clauseSections = React.useMemo(() => {
    // Group clauses by their main section (first digit of clause number)
    const sections: Record<string, any[]> = {};

    // Process the gap data
    gapData.forEach((item) => {
      if (!item?.clause?.clause) {
        console.warn("Invalid clause data:", item);
        return;
      }

      const clauseNumber = item.clause.clause;
      const mainSection = clauseNumber.split(".")[0];

      if (!sections[mainSection]) {
        sections[mainSection] = [];
      }

      // Parse implementation percentage
      let implementationPercentage = 0;
      if (
        item.analysis?.output?.["Overall Compliance Status"]?.[
          "Implementation Percentage"
        ]
      ) {
        const percentageText =
          item.analysis.output["Overall Compliance Status"][
            "Implementation Percentage"
          ];
        const match = percentageText.match(/(\d+)%/);
        if (match) {
          implementationPercentage = Number.parseInt(match[1], 10);
        }
      } else if (item.analysis?.output?.["Implementation Percentage"]) {
        const percentageText =
          item.analysis.output["Implementation Percentage"];
        const match = percentageText.match(/(\d+)%/);
        if (match) {
          implementationPercentage = Number.parseInt(match[1], 10);
        }
      }

      // Determine status
      let status = "non-compliant";
      if (item.analysis?.output?.["Conformity Status"]) {
        const conformityStatus = item.analysis.output["Conformity Status"];
        if (conformityStatus.includes("Conformity")) {
          status = "compliant";
        } else if (conformityStatus.includes("Minor")) {
          status = "partial";
        }
      }

      // Extract evidence
      const evidence: string[] = [];
      if (
        item.analysis?.output?.["Documented Evidence"] &&
        item.analysis.output["Documented Evidence"] !== "[No data]" &&
        item.analysis.output["Documented Evidence"] !==
          "[No relevant documents found related to this clause]"
      ) {
        evidence.push(item.analysis.output["Documented Evidence"]);
      } else if (item.analysis?.output?.["Evidence Found"]) {
        // Check if "Evidence Found" is an array before iterating
        if (Array.isArray(item.analysis.output["Evidence Found"])) {
          item.analysis.output["Evidence Found"].forEach((ev: any) => {
            evidence.push(`${ev["File Name"]}: ${ev["Extracted Content"]}`);
          });
        } else if (item.analysis.output["Evidence Found"]) {
          // If it's not an array but still has a value, handle it as needed (e.g., treat it as a string)
          evidence.push(item.analysis.output["Evidence Found"]);
        }
      }

      // Create nonConformities object
      const nonConformities = item.analysis?.output?.["Non-Conformities"]
        ? {
            rootCause:
              item.analysis.output["Non-Conformities"]["Root Cause Analysis"],
            timelineForCorrection:
              item.analysis.output["Non-Conformities"][
                "Timeline For Correction"
              ],
            items:
              item.analysis.output["Non-Conformities"][
                "List Of Non-Conformities"
              ] || [],
            correctiveActionRecommendations:
              item.analysis.output["Non-Conformities"][
                "Corrective Action Recommendations"
              ],
          }
        : undefined;

      // Add the clause
      sections[mainSection].push({
        id: `clause-${clauseNumber.replace(/\./g, "-")}`,
        number: clauseNumber,
        title: item.clause.title,
        description: item.clause.explanation,
        status,
        implementationPercentage,
        evidence,
        findings:
          item.analysis?.output?.["Findings"] ||
          item.analysis?.output?.["Gap Analysis Findings"],
        conformityStatus: item.analysis?.output?.["Conformity Status"],
        gapClosureStatus:
          item.analysis?.output?.["Gap Closure Status"]?.toLowerCase(),
        nonConformities,
      });
    });

    // Convert to array and calculate section implementation percentages
    return Object.entries(sections)
      .map(([sectionNumber, clauses]) => {
        const totalImplementation = clauses.reduce(
          (sum, clause) => sum + clause.implementationPercentage,
          0
        );
        const avgImplementation =
          clauses.length > 0
            ? Math.round(totalImplementation / clauses.length)
            : 0;

        return {
          id: `section-${sectionNumber}`,
          title: getSectionTitle(sectionNumber),
          clauses,
          implementationPercentage: avgImplementation,
        };
      })
      .sort((a, b) => {
        // Sort by section number
        const numA = Number.parseInt(a.id.replace("section-", ""), 10);
        const numB = Number.parseInt(b.id.replace("section-", ""), 10);
        return numA - numB;
      });
  }, [gapData]);

  // Calculate overall implementation percentage
  const overallImplementation = React.useMemo(() => {
    const totalClauses = clauseSections.reduce(
      (acc, section) => acc + section.clauses.length,
      0
    );
    const totalImplementation = clauseSections.reduce((acc, section) => {
      return (
        acc +
        section.clauses.reduce(
          (acc2, clause) => acc2 + clause.implementationPercentage,
          0
        )
      );
    }, 0);

    return totalClauses > 0
      ? Math.round(totalImplementation / totalClauses)
      : 0;
  }, [clauseSections]);

  // Calculate non-conformity statistics
  const nonConformityStats = React.useMemo(() => {
    // Count non-conformities from the clauses
    let major = 0;
    let minor = 0;
    const observation = 0;
    let open = 0;
    let inProgress = 0;
    let closed = 0;

    clauseSections.forEach((section) => {
      section.clauses.forEach((clause) => {
        if (clause.conformityStatus?.includes("Major")) {
          major++;
          if (clause.gapClosureStatus === "open") open++;
          else if (clause.gapClosureStatus === "in-progress") inProgress++;
          else if (clause.gapClosureStatus === "closed") closed++;
        } else if (clause.conformityStatus?.includes("Minor")) {
          minor++;
          if (clause.gapClosureStatus === "open") open++;
          else if (clause.gapClosureStatus === "in-progress") inProgress++;
          else if (clause.gapClosureStatus === "closed") closed++;
        }
      });
    });

    const total = major + minor + observation;

    return { total, major, minor, observation, open, inProgress, closed };
  }, [clauseSections]);

  // Filter clauses based on search term
  const filteredSections = React.useMemo(() => {
    if (!searchTerm) return clauseSections;

    return clauseSections
      .map((section) => ({
        ...section,
        clauses: section.clauses.filter(
          (clause) =>
            // Match search term in clause number, title, or description (case-insensitive)
            clause.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((section) => section.clauses.length > 0); // Filter out sections with no matching clauses
  }, [searchTerm, clauseSections]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle clause expansion
  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));
  };

  /**
   * 5. Start or update the Gap Analysis using refine's create/update
   */
  const startGapAnalysis = async () => {
    if (!selectedCertificate) {
      toast.error("No certificate selected");
      return;
    }

    setIsAnalyzing(true);

    try {
      const existingRecords = gapAnalysisResponse?.data || [];

      if (existingRecords.length > 0) {
        // We already have a gap_analysis record for this certificate
        const existingRecord = existingRecords[0];

        updateGapAnalysis(
          {
            resource: "gap_analysis",
            id: existingRecord.id,
            values: {
              status: "start_analysis",
              updated_at: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              toast.success("Gap analysis started successfully");
              // Refetch to get the updated status
              refetch();
            },
            onError: (error) => {
              console.error("Error updating gap analysis:", error);
              toast.error("Failed to start gap analysis");
            },
            onSettled: () => {
              setIsAnalyzing(false);
            },
          }
        );
      } else {
        // No existing record for this certificate, create a new one
        createGapAnalysis(
          {
            resource: "gap_analysis",
            values: {
              client_certificate_id: selectedCertificate.id,
              status: "start_analysis",
              created_at: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              toast.success("Gap analysis started successfully");
              // Refetch to get the newly created record with its status
              refetch();
            },
            onError: (error) => {
              console.error("Error creating gap analysis:", error);
              toast.error("Failed to start gap analysis");
            },
            onSettled: () => {
              setIsAnalyzing(false);
            },
          }
        );
      }
    } catch (error) {
      console.error("Error starting gap analysis:", error);
      toast.error("Failed to start gap analysis");
      setIsAnalyzing(false);
    }
  };

  // Set up Supabase real-time subscription
  React.useEffect(() => {
    if (!selectedCertificate) return;

    // First, fetch the initial data
    refetch();

    // Then set up real-time subscription
    const subscription = supabaseBrowserClient
      .channel(`gap_analysis_${selectedCertificate.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gap_analysis",
          filter: `client_certificate_id=eq.${selectedCertificate.id}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          // Fetch fresh data when a change is detected
          refetch();

          // Show a notification based on the event type
          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status;
            if (newStatus === "completed_analysis") {
              toast.success("Gap analysis completed");
            } else if (newStatus === "processing" || newStatus === "in_progress") {
              toast.info("Gap analysis in progress...");
            }
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabaseBrowserClient.removeChannel(subscription);
    };
  }, [selectedCertificate, refetch]);

  // Check if analysis is in progress based on status
  const isAnalysisInProgress = React.useMemo(() => {
    if (!analysisStatus) return false;

    // These statuses indicate the analysis is still processing
    const processingStatuses = [
      "start_analysis",
      "processing",
      "in_progress",
      "analyzing",
    ];

    return processingStatuses.includes(analysisStatus);
  }, [analysisStatus]);

  // ---- Render Logic / Edge Cases ----
  // 1) If there's no certificate, show an appealing prompt
  if (!selectedCertificate?.id) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Certificate Selected</h3>
        <p className="text-muted-foreground max-w-md">
          Please select a certificate from the dropdown menu to view its gap
          analysis data.
        </p>
      </div>
    );
  }

  // 2) If refine is still loading data, show a loading state
  if (isGapAnalysisLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Loader className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Loading Gap Analysis</h3>
        <p className="text-muted-foreground">
          Retrieving data for {selectedCertificate.certifications.name}...
        </p>
      </div>
    );
  }

  // 3) If there's a refine error, show an error message
  if (isGapAnalysisError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-red-100 p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Failed to Load Data</h3>
        <p className="text-muted-foreground mb-4">
          We encountered an error while retrieving the gap analysis data.
        </p>
        {gapAnalysisError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800 max-w-md">
            {gapAnalysisError.message}
          </div>
        )}
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // 4) If analysis is in progress, show processing state
  if (isAnalysisInProgress) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-blue-100 p-6 mb-4">
          <Loader className="h-10 w-10 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Analysis in Progress</h3>
        <p className="text-muted-foreground mb-6">
          We're analyzing your documentation and generating a comprehensive gap
          analysis report. This may take a few minutes.
        </p>
        {/* <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-6">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
        </div> */}
        {/* <p className="text-sm text-muted-foreground">
          Current status: <span className="font-medium">{analysisStatus}</span>
        </p>
        <Button variant="outline" className="mt-6" onClick={() => refetch()}>
          Check Status
        </Button> */}
      </div>
    );
  }

  // 5) If we have not loaded or found any gap data yet, show fallback
  if (!isGapAnalysisLoading && gapData.length === 0) {
    return (
      <NoDataFallback
        onStartAnalysis={startGapAnalysis}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  // 6) If search returns no results, show a message
  if (filteredSections.length === 0 && searchTerm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clauses..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={startGapAnalysis}
            disabled={isAnalyzing || !selectedCertificate}
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                <span>Starting Analysis...</span>
              </>
            ) : (
              <span>AI Analysis</span>
            )}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground max-w-md">
            No clauses match your search term "{searchTerm}". Try a different
            search term or clear the search.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clauses..."
            className="w-[250px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={startGapAnalysis}
          disabled={isAnalyzing || !selectedCertificate}
        >
          {isAnalyzing ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              <span>Starting Analysis...</span>
            </>
          ) : (
            <span>AI Analysis</span>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <OverallImplementationCard
          implementationPercentage={overallImplementation}
        />
        <NonConformitiesCard stats={nonConformityStats} />
        <GapStatusCard stats={nonConformityStats} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gap Analysis Results</CardTitle>
          <CardDescription>
            Detailed analysis of compliance with ISO requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                expandedClauses={expandedClauses}
                isExpanded={!!expandedSections[section.id]}
                onToggleSection={() => toggleSection(section.id)}
                onToggleClause={toggleClause}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
