"use client";
import type React from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Layers,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { ComplianceOverview } from "@/components/compliance-overview";
import { useGetIdentity } from "@refinedev/core";

export default function ComplianceDashboard() {
  const { data: identity } = useGetIdentity();

  return (
    <>
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Health Check and Task List */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm">
            <h2 className="p-4 text-xl font-semibold">Acme Inc Health Check</h2>

            <div className="flex">
              <div className="flex-1 p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-500">
                      <th className="pb-2 text-left font-medium">Category</th>
                      <th className="pb-2 text-center font-medium">Review</th>
                      <th className="pb-2 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <HealthCheckRow
                      category="Internal auditing"
                      count={5}
                      percentage={90}
                    />
                    <HealthCheckRow
                      category="Management reviews"
                      count={3}
                      percentage={56}
                    />
                    <HealthCheckRow
                      category="Training"
                      count={2}
                      percentage={24}
                    />
                    <HealthCheckRow
                      category="Customers"
                      count={2}
                      percentage={10}
                    />
                    <HealthCheckRow
                      category="Suppliers"
                      count={0}
                      percentage={0}
                    />
                  </tbody>
                </table>
              </div>

              <div className="flex-1 p-4">
                <div className="relative flex items-center justify-center">
                  <DonutChart />
                  <div className="absolute text-center">
                    <div className="text-sm font-medium">None</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <StatusItem color="bg-red-500" label="High" />
                  <StatusItem color="bg-yellow-400" label="Medium" />
                  <StatusItem color="bg-green-500" label="Low" />
                  <StatusItem color="bg-gray-200" label="None" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 mt-4 border-t">
              <MetricItem
                label="Non-conformities"
                value={8}
                color="text-red-500"
              />
              <MetricItem label="Risks" value={3} color="text-red-500" />
              <MetricItem
                label="Opportunities"
                value={7}
                color="text-green-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <h2 className="p-4 text-xl font-semibold">Task list</h2>

            <div>
              <TaskSection
                title="Today"
                expanded={true}
                tasks={[
                  {
                    title: "ISO 9001:2015 surveillance audit",
                    dueDate: "Due Dec 23, 2024",
                  },
                  {
                    title: "Internal audit due",
                    dueDate: "Due May 27, 2025",
                  },
                  {
                    title: "Management review due",
                    dueDate: "Due July 12, 2025",
                  },
                ]}
              />

              <TaskSection title="Tomorrow" expanded={false} tasks={[]} />

              <TaskSection title="Next week" expanded={false} tasks={[]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function HealthCheckRow({
  category,
  count,
  percentage,
}: {
  category: string;
  count: number;
  percentage: number;
}) {
  const getColor = () => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <tr className="border-b last:border-b-0">
      <td className="py-3">{category}</td>
      <td className="py-3 text-center">{count}</td>
      <td className={`py-3 text-right ${getColor()}`}>{percentage}%</td>
    </tr>
  );
}

function DonutChart() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="#f0f0f0"
        strokeWidth="12"
      />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="#ef4444"
        strokeWidth="12"
        strokeDasharray="339.292"
        strokeDashoffset="254.469"
        transform="rotate(-90 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="#facc15"
        strokeWidth="12"
        strokeDasharray="339.292"
        strokeDashoffset="254.469"
        // strokeDashoffset="169.646"
        transform="rotate(-90 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="#22c55e"
        strokeWidth="12"
        strokeDasharray="339.292"
        strokeDashoffset="84.823"
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}

function StatusItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
        <div className={`w-3 h-0.5 ${color}`}></div>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TaskSection({
  title,
  expanded,
  tasks,
}: {
  title: string;
  expanded: boolean;
  tasks: { title: string; dueDate: string }[];
}) {
  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-medium">{title}</h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 border-gray-300 rounded-sm"
              />
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500">{task.dueDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
