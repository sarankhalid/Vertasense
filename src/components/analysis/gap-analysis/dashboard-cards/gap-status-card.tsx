import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { NonConformityStats } from "@/types/analysis-types"

interface GapStatusCardProps {
  stats: NonConformityStats
}

export function GapStatusCard({ stats }: GapStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Gap Status</CardTitle>
        <CardDescription>Current status of identified gaps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Open</span>
              <span className="text-sm font-medium">{stats.open}</span>
            </div>
            <Progress
              value={stats.total > 0 ? (stats.open / stats.total) * 100 : 0}
              className="h-2 bg-muted"
              indicatorClassName="bg-red-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">In Progress</span>
              <span className="text-sm font-medium">{stats.inProgress}</span>
            </div>
            <Progress
              value={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}
              className="h-2 bg-muted"
              indicatorClassName="bg-amber-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Closed</span>
              <span className="text-sm font-medium">{stats.closed}</span>
            </div>
            <Progress
              value={stats.total > 0 ? (stats.closed / stats.total) * 100 : 0}
              className="h-2 bg-muted"
              indicatorClassName="bg-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
