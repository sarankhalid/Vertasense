"use client";

import * as React from "react";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuditSummaryCard } from "./audit-summary-card";
import { AuditFindingsCard } from "./audit-findings-card";
import { ComplianceStatusCard } from "./compliance-status-card";
import { AuditFindingsDetail } from "./audit-findings-detail";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "@/store/useCertificateStore";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { NoDataFallback } from "../gap-analysis/no-data-fallback";
import { useSubscription } from "@refinedev/core";

type ClauseStatus =
  | "compliant"
  | "non-compliant"
  | "partial"
  | "not-applicable";
type GapStatus = "open" | "in-progress" | "closed";

interface Clause {
  id: string;
  number: string;
  title: string;
  description: string;
  status: ClauseStatus;
  implementationPercentage: number;
  evidence?: string[];
  findings?: string;
  conformityStatus?: string;
  gapClosureStatus?: GapStatus;
}

interface ClauseSection {
  id: string;
  title: string;
  clauses: Clause[];
  implementationPercentage: number;
}

interface AuditAnalysisProps {
  sections: ClauseSection[];
}

export function AuditAnalysis() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [analysisStatus, setAnalysisStatus] = React.useState<string | null>(
    null
  );
  const { selectedCertificate } = useCertificateStore();
  const [auditData, setAuditData] = React.useState<any[]>([]); // State to hold fetched audit data

  const fetchAuditData = async () => {
    if (!selectedCertificate?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseBrowserClient
        .from("audit_analysis")
        .select("*")
        .eq("client_certificate_id", selectedCertificate?.id);

      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
        setAuditData([]);
        setAnalysisStatus(null);
        setIsLoading(false);
        return;
      }

      // Store the analysis status
      setAnalysisStatus(data[0].status);

      // Check if we have audit results and they're in the expected format
      if (data[0]?.audit_results?.versions?.[0]?.results) {
        setAuditData(data[0].audit_results.versions[0].results);
      } else if (data[0]?.audit_results?.data) {
        // Alternative data structure
        setAuditData(data[0].audit_results.data);
      } else {
        // No valid data structure found
        setAuditData([]);
      }
    } catch (error) {
      console.error("Error fetching audit data:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to load audit data")
      );
      toast.error("Failed to load audit data");
    } finally {
      setIsLoading(false);
    }
  };

  // React.useEffect(() => {
  //   if (selectedCertificate) {
  //     fetchAuditData();
  //   }
  // }, [selectedCertificate]);

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

  const auditAnalysisSections: ClauseSection[] = React.useMemo(() => {
    const sections: Record<string, Clause[]> = {};

    auditData.forEach((item) => {
      const clauseNumber = item.clause.clause;
      const sectionTitle = getSectionTitle(item.clause); // Get title from the clause

      const mainSection = clauseNumber.split(".")[0]; // Extract section number

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
      }

      let status: ClauseStatus = "non-compliant";
      if (item.analysis?.output?.["Conformity Status"]) {
        const conformityStatus = item.analysis.output["Conformity Status"];
        if (conformityStatus.includes("Conformity")) {
          status = "compliant";
        } else if (conformityStatus.includes("Minor")) {
          status = "partial";
        }
      }

      const evidence: string[] = [];
      if (
        item.analysis?.output?.["Documented Evidence"] &&
        item.analysis.output["Documented Evidence"] !== "[No data]" &&
        item.analysis.output["Documented Evidence"] !==
          "[No relevant documents found related to this clause]"
      ) {
        evidence.push(item.analysis.output["Documented Evidence"]);
      }

      sections[mainSection].push({
        id: `audit-clause-${clauseNumber.replace(/\./g, "-")}`,
        number: clauseNumber,
        title: item.clause.title, // Use clause title directly
        description: item.clause.explanation,
        status,
        implementationPercentage,
        evidence,
        findings: item.analysis?.output?.["Findings"],
        conformityStatus: item.analysis?.output?.["Conformity Status"],
        gapClosureStatus: item.analysis?.output?.[
          "Gap Closure Status"
        ]?.toLowerCase() as GapStatus,
      });
    });

    // Now that we have all clauses grouped by main section, let's set titles based on clauses without subpoints
    return Object.entries(sections)
      .map(([sectionNumber, clauses]) => {
        // Find the clause with no subpoints (e.g., 1, 2, 3, ... instead of 1.1, 1.2, 2.1, ...)
        const mainClause = clauses.find(
          (clause) => !clause.number.includes(".")
        );

        // If no such clause exists, use the first clause in the section as fallback
        const sectionTitle = mainClause ? mainClause.title : clauses[0].title;

        const totalImplementation = clauses.reduce(
          (sum, clause) => sum + clause.implementationPercentage,
          0
        );
        const avgImplementation =
          clauses.length > 0
            ? Math.round(totalImplementation / clauses.length)
            : 0;

        return {
          id: `audit-section-${sectionNumber}`,
          title: sectionTitle, // Use the title of the main clause as the section title
          clauses,
          implementationPercentage: avgImplementation,
        };
      })
      .sort((a, b) => {
        const numA = Number.parseInt(a.id.replace("audit-section-", ""), 10);
        const numB = Number.parseInt(b.id.replace("audit-section-", ""), 10);
        return numA - numB;
      });
  }, [auditData]);

  // Calculate audit findings statistics
  const auditFindingsStats = React.useMemo(() => {
    let major = 0;
    let minor = 0;
    let observation = 0;

    auditAnalysisSections.forEach((section) => {
      section.clauses.forEach((clause) => {
        if (clause.conformityStatus?.includes("Major")) {
          major++;
        } else if (clause.conformityStatus?.includes("Minor")) {
          minor++;
        } else if (clause.findings && !clause.findings.includes("[No data]")) {
          observation++;
        }
      });
    });

    return { major, minor, observation };
  }, [auditAnalysisSections]);

  const startAuditAnalysis = async () => {
    if (!selectedCertificate) {
      toast.error("No certificate selected");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: existingAnalysis, error: checkError } =
        await supabaseBrowserClient
          .from("audit_analysis")
          .select("id")
          .eq("client_certificate_id", selectedCertificate.id)
          .maybeSingle();

      if (checkError) {
        throw new Error(checkError.message);
      }

      let result;

      if (existingAnalysis) {
        result = await supabaseBrowserClient
          .from("audit_analysis")
          .update({
            status: "start_analysis",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAnalysis.id);
      } else {
        result = await supabaseBrowserClient.from("audit_analysis").insert({
          client_certificate_id: selectedCertificate.id,
          status: "start_analysis",
          audit_date: new Date().toISOString(),
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Audit analysis started successfully");
    } catch (error) {
      console.error("Error starting audit analysis:", error);
      toast.error("Failed to start audit analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Set up Supabase real-time subscription
  React.useEffect(() => {
    if (!selectedCertificate) return;

    // First, fetch the initial data
    fetchAuditData();

    // Then set up real-time subscription
    const subscription = supabaseBrowserClient
      .channel(`audit_analysis_${selectedCertificate.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "audit_analysis",
          filter: `client_certificate_id=eq.${selectedCertificate.id}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          // Fetch fresh data when a change is detected
          fetchAuditData();

          // Show a notification based on the event type
          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status;
            if (newStatus === "completed") {
              toast.success("Audit analysis completed");
            } else if (
              newStatus === "processing" ||
              newStatus === "in_progress"
            ) {
              toast.info("Audit analysis in progress...");
            }
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabaseBrowserClient.removeChannel(subscription);
    };
  }, [selectedCertificate]);

  // // Set up real-time subscription using refine's useSubscription hook
  // useSubscription({
  //   channel: selectedCertificate
  //     ? `audit_analysis:client_certificate_id=eq.${selectedCertificate.id}`
  //     : null,
  //   enabled: !!selectedCertificate,
  //   onLiveEvent: (event) => {
  //     const eventData = event.payload;
  //     console.log("Real-time update received:", eventData);

  //     // Refresh data when we get an update
  //     fetchAuditData();

  //     // Show notification
  //     if (event.type === "INSERT") {
  //       toast.success("New audit analysis data available");
  //     } else if (event.type === "UPDATE") {
  //       toast.success("Audit analysis has been updated");
  //     }
  //   },
  //   onError: (error) => {
  //     console.error("Real-time subscription error:", error);
  //     toast.error("Real-time connection lost. Updates may be delayed.");
  //   },
  // });

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

  // Define filteredSections before any conditional returns
  const filteredSections = React.useMemo(() => {
    // Ensure that auditAnalysisSections is always a valid array, even if empty
    const sections = Array.isArray(auditAnalysisSections) ? auditAnalysisSections : [];
  
    if (!searchTerm) return sections;
  
    return sections
      .map((section) => ({
        ...section,
        clauses: section.clauses.filter(
          (clause) =>
            clause.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (clause.findings && clause.findings.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
      }))
      .filter((section) => section.clauses.length > 0); // Filter out sections with no matching clauses
  }, [searchTerm, auditAnalysisSections]);
  
  // Now render the appropriate UI based on conditions
  const renderContent = () => {
    // 1) If there's no certificate, show an appealing prompt
    if (!selectedCertificate?.id) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Certificate Selected</h3>
          <p className="text-muted-foreground max-w-md">
            Please select a certificate from the dropdown menu to view its audit
            analysis data.
          </p>
        </div>
      );
    }

    // 2) If still loading data, show a loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Loader className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Loading Audit Analysis</h3>
          <p className="text-muted-foreground">
            Retrieving data for {selectedCertificate.certifications.name}...
          </p>
        </div>
      );
    }

    // 3) If there's an error, show an error message
    if (error) {
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
            We encountered an error while retrieving the audit analysis data.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800 max-w-md">
            {error.message}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchAuditData()}
          >
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
            We're analyzing your documentation and generating a comprehensive
            audit analysis report. This may take a few minutes.
          </p>
        </div>
      );
    }

    // 5) If no audit data is found, show a fallback UI
    if (auditData.length === 0) {
      return (
        <NoDataFallback
          onStartAnalysis={startAuditAnalysis}
          isAnalyzing={isAnalyzing}
        />
      );
    }

    // 6) If search returns no results, show a message
    if (filteredSections.length === 0 && searchTerm) {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            {/* <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search audit findings..."
                className="w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={startAuditAnalysis}
            disabled={isAnalyzing || !selectedCertificate}
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                <span>Starting Analysis...</span>
              </>
            ) : (
              <span>Start Audit Analysis</span>
            )}
          </Button>
        </div>

          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground max-w-md">
              No audit findings match your search term "{searchTerm}". Try a
              different search term or clear the search.
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

    // 7) Default case: show the main UI
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          {/* <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search audit findings..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={startAuditAnalysis}
            disabled={isAnalyzing || !selectedCertificate}
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                <span>Starting Analysis...</span>
              </>
            ) : (
              <span>Start Audit Analysis</span>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* <AuditSummaryCard
            auditDate={new Date().toLocaleDateString()}
            auditor="ISO Compliance Team"
            auditType="Internal"
            standard="ISO 27001"
            overallResult="conditional-pass"
          /> */}
          <AuditFindingsCard
            major={auditFindingsStats.major}
            minor={auditFindingsStats.minor}
            observation={auditFindingsStats.observation}
          />
          {/* <ComplianceStatusCard sections={auditAnalysisSections.slice(0, 5)} /> */}
        </div>

        <AuditFindingsDetail
          sections={filteredSections}
          searchTerm={searchTerm}
        />
      </div>
    );
  };

  return renderContent();
}
