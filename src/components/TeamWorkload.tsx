import React from "react";
import { Users, AlertTriangle, CheckCircle, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { TeamMember, Task } from "@/types/nexus";

interface TeamWorkloadProps {
  team: TeamMember[];
  tasks: Task[];
  onRebalance: () => void;
  rebalancedNotice?: string | null;
}

export const TeamWorkload: React.FC<TeamWorkloadProps> = ({
  team,
  tasks,
  onRebalance,
  rebalancedNotice,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Real-Time Team Workload & Heatmap</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive load calculation mapping active sprint commitments against 40h velocity thresholds.
          </p>
        </div>

        <button
          onClick={onRebalance}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Trigger 1-Click AI Rebalance
        </button>
      </div>

      {rebalancedNotice && (
        <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3 flex items-center gap-2 text-xs text-purple-200">
          <Zap className="h-4 w-4 text-purple-400 shrink-0" />
          <span>{rebalancedNotice}</span>
        </div>
      )}

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const loadPercentage = Math.round(
            (member.currentLoadHours / member.maxCapacityHours) * 100
          );
          const isOverloaded = member.status === "overloaded";
          const isWarning = member.status === "warning";

          const assignedTasks = tasks.filter((t) => t.assigneeId === member.id);

          return (
            <div
              key={member.id}
              className={`rounded-xl border p-4.5 transition-all ${
                isOverloaded
                  ? "border-rose-500/40 bg-rose-950/20 shadow-lg shadow-rose-950/20"
                  : isWarning
                  ? "border-amber-500/30 bg-slate-950/80"
                  : "border-slate-800 bg-slate-950/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white text-sm border border-slate-700">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <span className="text-[11px] text-cyan-400 font-medium">{member.role}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOverloaded
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : isWarning
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {isOverloaded ? "Overloaded" : isWarning ? "Near Limit" : "Optimal"}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Sprint Allocation</span>
                  <span
                    className={`font-bold ${
                      isOverloaded ? "text-rose-400" : isWarning ? "text-amber-400" : "text-slate-200"
                    }`}
                  >
                    {member.currentLoadHours}h / {member.maxCapacityHours}h ({loadPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverloaded
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-cyan-500 to-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, loadPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Avg Velocity: <strong className="text-slate-200">{member.avgVelocityPoints} pts</strong></span>
                <span>Assigned: <strong className="text-cyan-300">{assignedTasks.length} tasks</strong></span>
              </div>

              {/* Skill Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
