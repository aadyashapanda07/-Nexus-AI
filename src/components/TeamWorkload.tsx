import React from "react";
import { Users, RefreshCw, Zap } from "lucide-react";
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
    <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-950 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-500/30">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Real-Time Team Workload &amp; Heatmap</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictive load calculation mapping active sprint commitments against 40h velocity thresholds.
          </p>
        </div>

        <button
          onClick={onRebalance}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Trigger 1-Click AI Rebalance
        </button>
      </div>

      {rebalancedNotice && (
        <div className="rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-fuchsia-500/40 p-3.5 flex items-center gap-2 text-xs text-purple-900 dark:text-purple-200 shadow-sm">
          <Zap className="h-4 w-4 text-purple-600 dark:text-fuchsia-400 shrink-0" />
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
                  ? "border-rose-300 bg-rose-50/70 dark:border-rose-500/50 dark:bg-rose-950/25 shadow-sm shadow-rose-500/10"
                  : isWarning
                  ? "border-amber-300 bg-amber-50/70 dark:border-amber-500/30 dark:bg-[#12082b]/90"
                  : "border-purple-200/80 bg-purple-50/40 dark:border-purple-950/80 dark:bg-[#100726]/70 hover:border-purple-400 dark:hover:border-violet-600/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/25">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</h3>
                    <span className="text-[11px] text-purple-700 dark:text-fuchsia-400 font-medium">{member.role}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOverloaded
                      ? "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                      : isWarning
                      ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                  }`}
                >
                  {isOverloaded ? "Overloaded" : isWarning ? "Near Limit" : "Optimal"}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Sprint Allocation</span>
                  <span
                    className={`font-bold ${
                      isOverloaded ? "text-rose-600 dark:text-rose-400" : isWarning ? "text-amber-600 dark:text-amber-400" : "text-purple-900 dark:text-violet-200"
                    }`}
                  >
                    {member.currentLoadHours}h / {member.maxCapacityHours}h ({loadPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-purple-100 dark:bg-[#09041a] rounded-full overflow-hidden border border-purple-200 dark:border-purple-950">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverloaded
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500"
                    }`}
                    style={{ width: `${Math.min(100, loadPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-3.5 pt-3 border-t border-purple-100 dark:border-purple-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Avg Velocity: <strong className="text-slate-900 dark:text-violet-200">{member.avgVelocityPoints} pts</strong></span>
                <span>Assigned: <strong className="text-purple-700 dark:text-fuchsia-300">{assignedTasks.length} tasks</strong></span>
              </div>

              {/* Skill Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 font-mono shadow-xs"
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
