import React from "react";
import { TrendingDown, Zap, ShieldCheck, Clock, Users, ArrowUpRight } from "lucide-react";
import { TeamMember, Task, Sprint } from "@/types/nexus";

interface DashboardMetricsProps {
  tasks: Task[];
  team: TeamMember[];
  sprint: Sprint;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ tasks, team, sprint }) => {
  const totalPredictedHours = tasks.reduce((acc, t) => acc + t.aiPredictedHours, 0);
  const avgConfidence = Math.round(
    tasks.reduce((acc, t) => acc + t.confidenceScore, 0) / (tasks.length || 1)
  );

  const overloadedCount = team.filter((m) => m.currentLoadHours > m.maxCapacityHours).length;
  const balanceScore = Math.max(60, 100 - overloadedCount * 14);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Key Result Card: 40% Delivery Time Reduction */}
      <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-purple-100/90 via-fuchsia-50/70 to-white dark:from-purple-950/60 dark:via-[#13092b] dark:to-[#0c051d] p-5 shadow-xl shadow-purple-500/10 dark:shadow-purple-950/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-15 dark:opacity-20 pointer-events-none">
          <TrendingDown className="h-24 w-24 text-fuchsia-600 dark:text-fuchsia-400 transform -rotate-12" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-400">
            Key Result
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 dark:bg-fuchsia-500/20 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-400/30">
            <ArrowUpRight className="h-3 w-3" /> Beta Verified
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 dark:from-violet-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent">
            -40%
          </span>
          <span className="text-xs text-purple-900/80 dark:text-purple-200 font-medium">Delivery Time</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Predictive task estimation &amp; workload balancing reduced average cycle time from 14.2 to 8.5 days.
        </p>
      </div>

      {/* AI Velocity Metric */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-[#0f0724]/80 p-5 shadow-sm shadow-purple-500/5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sprint Velocity</span>
          <div className="rounded-lg bg-violet-100 dark:bg-violet-500/15 p-2 text-violet-700 dark:text-violet-400">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{sprint.allocatedPoints} / {sprint.capacityPoints}</span>
          <span className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400">pts committed</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span>Capacity Utilized</span>
            <span>{Math.round((sprint.allocatedPoints / sprint.capacityPoints) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-purple-100 dark:bg-purple-950/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 rounded-full shadow-sm shadow-fuchsia-500/40"
              style={{ width: `${Math.min(100, (sprint.allocatedPoints / sprint.capacityPoints) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prediction Engine Confidence */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-[#0f0724]/80 p-5 shadow-sm shadow-purple-500/5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Confidence Index</span>
          <div className="rounded-lg bg-fuchsia-100 dark:bg-fuchsia-500/15 p-2 text-fuchsia-700 dark:text-fuchsia-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgConfidence}%</span>
          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">High Precision</span>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
          <span>{totalPredictedHours.toFixed(1)} hrs total backlog forecast</span>
        </p>
      </div>

      {/* Team Balance Score */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-[#0f0724]/80 p-5 shadow-sm shadow-purple-500/5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Workload Balance</span>
          <div className="rounded-lg bg-pink-100 dark:bg-pink-500/15 p-2 text-pink-700 dark:text-pink-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{balanceScore}%</span>
          <span className={`text-xs font-semibold ${overloadedCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {overloadedCount > 0 ? `${overloadedCount} Over-allocated` : "Optimal Distribution"}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Evaluated across {team.length} engineers with real-time capacity monitoring.
        </p>
      </div>
    </div>
  );
};
