import { AnalysisTabs } from "@/components/analysis-tabs";
import { Search } from "lucide-react";

export default function AnalysisPage() {


  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Compliance Analysis</h1>
      <AnalysisTabs />
    </div>
  );
}
