"use client"
import { Button } from "@/components/ui/button"
import { useCertificateStore } from "@/store/useCertificateStore"

interface NoDataFallbackProps {
  onStartAnalysis: () => void
  isAnalyzing: boolean
}

export function NoDataFallback({ onStartAnalysis, isAnalyzing }: NoDataFallbackProps) {
  const { selectedCertificate } = useCertificateStore()

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">No analysis data available</h3>
        <p className="text-muted-foreground mb-6">
          {selectedCertificate
            ? "No gap analysis data found for the selected certificate."
            : "Please select a certificate to view gap analysis data."}
        </p>
        <Button variant="outline" onClick={onStartAnalysis} disabled={isAnalyzing || !selectedCertificate}>
          {isAnalyzing ? "Starting Analysis..." : "Start Gap Analysis"}
        </Button>
      </div>
    </div>
  )
}
