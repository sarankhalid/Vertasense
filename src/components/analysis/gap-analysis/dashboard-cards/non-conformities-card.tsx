import { AlertCircle, Info, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NonConformityStats } from "@/types/analysis-types"

interface NonConformitiesCardProps {
  stats: NonConformityStats
}

export function NonConformitiesCard({ stats }: NonConformitiesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Non-Conformities</CardTitle>
        <CardDescription>Summary of identified issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <XCircle className="w-4 h-4 text-red-500 mr-2" />
              Major
            </span>
            <span className="font-semibold">{stats.major}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
              Minor
            </span>
            <span className="font-semibold">{stats.minor}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Info className="w-4 h-4 text-blue-500 mr-2" />
              Observations
            </span>
            <span className="font-semibold">{stats.observation}</span>
          </div>
          <div className="pt-2 mt-2 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
              <span>{stats.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
