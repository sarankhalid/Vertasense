import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OverallImplementationCardProps {
  implementationPercentage: number
}

export function OverallImplementationCard({ implementationPercentage }: OverallImplementationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overall Implementation</CardTitle>
        <CardDescription>Implementation progress across all clauses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - implementationPercentage / 100)}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{implementationPercentage}%</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {implementationPercentage < 30
                ? "Significant improvement needed"
                : implementationPercentage < 70
                  ? "Making progress, but more work needed"
                  : "Good progress toward compliance"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
