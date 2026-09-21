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
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-900/80 p-5 shadow-lg shadow-cyan-950/30">
        <div className="absolute top-0 right-0 p-4 opacity-15">
          <TrendingDown className="h-24 w-24 text-cyan-400 transform -rotate-12" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Key Result
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
            <ArrowUpRight className="h-3 w-3" /> Beta Verified
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">-40%</span>
          <span className="text-xs text-slate-300 font-medium">Delivery Time</span>
        </div>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          Predictive task estimation & workload balancing reduced average cycle time from 14.2 to 8.5 days.
        </p>
      </div>

      {/* AI Velocity Metric */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Sprint Velocity</span>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{sprint.allocatedPoints} / {sprint.capacityPoints}</span>
          <span className="text-xs font-semibold text-emerald-400">pts committed</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Capacity Utilized</span>
            <span>{Math.round((sprint.allocatedPoints / sprint.capacityPoints) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
              style={{ width: `${Math.min(100, (sprint.allocatedPoints / sprint.capacityPoints) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prediction Engine Confidence */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">AI Confidence Index</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{avgConfidence}%</span>
          <span className="text-xs text-emerald-400 font-medium">High Precision</span>
        </div>
        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>{totalPredictedHours.toFixed(1)} hrs total backlog forecast</span>
        </p>
      </div>

      {/* Team Balance Score */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Workload Balance</span>
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{balanceScore}%</span>
          <span className={`text-xs font-semibold ${overloadedCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {overloadedCount > 0 ? `${overloadedCount} Over-allocated` : "Optimal Distribution"}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Evaluated across {team.length} engineers with real-time capacity monitoring.
        </p>
      </div>
    </div>
  );
};
