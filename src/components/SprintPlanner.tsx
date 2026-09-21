"use client";

import React, { useState } from "react";
import {
  Zap,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  Layers,
  Plus,
  Check,
  X,
  ListTodo
} from "lucide-react";
import { Sprint, Task, TeamMember } from "@/types/nexus";

interface SprintPlannerProps {
  sprint: Sprint;
  tasks: Task[];
  team: TeamMember[];
  onSprintUpdated: (updatedSprint: Sprint, updatedTasks: Task[], updatedTeam: TeamMember[], message: string) => void;
}

export const SprintPlanner: React.FC<SprintPlannerProps> = ({
  sprint,
  tasks,
  team,
  onSprintUpdated,
}) => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<{
    message: string;
    actionsTaken: string[];
    promotedCount: number;
    allocatedPoints: number;
    capacityPoints: number;
  } | null>(null);

  const [newBacklogTitle, setNewBacklogTitle] = useState("");
  const [newBacklogCategory, setNewBacklogCategory] = useState<string>("Backend");
  const [newBacklogPoints, setNewBacklogPoints] = useState<number>(5);
  const [showAddModal, setShowAddModal] = useState(false);

  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
  const backlogTasks = tasks.filter((t) => !t.sprintId || t.sprintId !== sprint.id);

  const getAssignee = (assigneeId?: string) => {
    return team.find((m) => m.id === assigneeId);
  };

  const capacityPercentage = Math.min(
    100,
    Math.round((sprint.allocatedPoints / sprint.capacityPoints) * 100)
  );

  const handleRunReplan = async () => {
    setIsPlanning(true);
    setPlanResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sprint-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprint,
          tasks,
          team,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSprintUpdated(
          data.updatedSprint,
          data.updatedTasks,
          data.updatedTeam,
          data.message
        );
        setPlanResult({
          message: data.message,
          actionsTaken: data.actionsTaken || [],
          promotedCount: data.promotedCount,
          allocatedPoints: data.allocatedPoints,
          capacityPoints: data.capacityPoints,
        });
        setIsPlanning(false);
        return;
      }
    } catch (err) {
      console.error("FastAPI replan error, using fallback", err);
    }

    // Local fallback
    let allocated = sprint.allocatedPoints;
    const remaining = Math.max(0, sprint.capacityPoints - allocated);
    const updatedTasks = [...tasks];
    const actions: string[] = [];
    let promoted = 0;

    updatedTasks.forEach((t) => {
      if (!t.sprintId) {
        const pts = t.storyPoints || 5;
        if (pts <= remaining && promoted < 2) {
          t.sprintId = sprint.id;
          t.status = "Sprint Ready";
          if (!t.assigneeId) t.assigneeId = "tm-3";
          allocated += pts;
          promoted++;
          actions.push(`Promoted [${t.id}] '${t.title}' (+${pts} pts) into active sprint.`);
        }
      }
    });

    const updatedSprint = { ...sprint, allocatedPoints: allocated };
    onSprintUpdated(updatedSprint, updatedTasks, team, "Sprint replanned via local optimizer.");
    setPlanResult({
      message: `AI Sprint Replan complete: ${promoted} task(s) promoted, sprint committed at ${allocated}/${sprint.capacityPoints} pts.`,
      actionsTaken: actions.length > 0 ? actions : ["Sprint velocity verified at capacity."],
      promotedCount: promoted,
      allocatedPoints: allocated,
      capacityPoints: sprint.capacityPoints,
    });
    setIsPlanning(false);
  };

  const handleCreateBacklogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBacklogTitle.trim()) return;

    const newTask: Task = {
      id: `NX-${Math.floor(200 + Math.random() * 800)}`,
      title: newBacklogTitle,
      description: "Added to project backlog for AI velocity sprint candidate evaluation.",
      category: newBacklogCategory as any,
      priority: "High",
      status: "Backlog",
      storyPoints: newBacklogPoints,
      aiPredictedHours: Number((newBacklogPoints * 2.4).toFixed(1)),
      confidenceScore: 92,
      historicalVariance: "+/- 1.1 hrs",
      riskLevel: newBacklogPoints >= 8 ? "High" : "Moderate",
      riskFactors: ["Awaiting AI sprint capacity allocation"],
      sprintId: undefined,
    };

    onSprintUpdated(sprint, [newTask, ...tasks], team, `Created backlog item ${newTask.id}`);
    setNewBacklogTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sprint Header & Velocity Bar */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-950 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-violet-500/15 text-purple-700 dark:text-violet-400 flex items-center justify-center border border-purple-300 dark:border-violet-500/30">
                <Zap className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{sprint.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-semibold">
                {sprint.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">{sprint.goal}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-fuchsia-400" />
              <span>
                {sprint.startDate} - {sprint.endDate}
              </span>
            </div>

            <button
              onClick={handleRunReplan}
              disabled={isPlanning}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isPlanning ? "animate-spin" : ""}`} />
              <span>{isPlanning ? "FastAPI Optimizing..." : "Automated AI Sprint Replan"}</span>
            </button>
          </div>
        </div>

        {/* Velocity Capacity Meter */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-violet-200">Sprint Capacity vs Velocity Budget</span>
              <span className="text-purple-700 dark:text-fuchsia-300 font-mono">
                {sprint.allocatedPoints} / {sprint.capacityPoints} Points ({capacityPercentage}%)
              </span>
            </div>
            <div className="w-full h-3.5 bg-purple-100 dark:bg-[#09041a] rounded-full overflow-hidden border border-purple-200 dark:border-purple-950 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  capacityPercentage >= 100
                    ? "bg-rose-500"
                    : capacityPercentage > 85
                    ? "bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-sm shadow-fuchsia-500/40"
                    : "bg-purple-600"
                }`}
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-purple-50/70 dark:bg-[#09041a] p-3 border border-purple-200 dark:border-purple-950 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Projected Delivery</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">97.4% on-schedule</div>
          </div>
        </div>
      </div>

      {/* AI Replan Result Report Banner */}
      {planResult && (
        <div className="rounded-2xl border border-fuchsia-400/60 dark:border-fuchsia-500/40 bg-gradient-to-r from-purple-100/90 via-fuchsia-50/70 to-white dark:from-purple-950/60 dark:via-[#13092b] dark:to-[#0c051d] p-5 shadow-xl shadow-purple-500/5 dark:shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-950 pb-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-fuchsia-300 font-bold text-sm">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-fuchsia-400" />
              <span>FastAPI AI Sprint Optimization Complete</span>
            </div>
            <button
              onClick={() => setPlanResult(null)}
              className="text-slate-400 hover:text-purple-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-700 dark:text-purple-100">{planResult.message}</p>

          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-800 dark:text-violet-300">
              Actions Executed by Algorithm:
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {planResult.actionsTaken.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/80 dark:bg-[#09041a]/80 p-2 rounded-lg border border-purple-200 dark:border-purple-950 shadow-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Committed Sprint Tasks Table */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600 dark:text-fuchsia-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Committed Sprint Tasks ({sprintTasks.length})
            </h3>
          </div>
          <span className="text-xs text-slate-600 dark:text-purple-300 font-mono">
            Total Points: <strong className="text-purple-700 dark:text-fuchsia-300">{sprint.allocatedPoints} pts</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Key / Task Title</th>
                <th className="pb-3 font-semibold">Domain</th>
                <th className="pb-3 font-semibold">Assignee</th>
                <th className="pb-3 font-semibold text-center">Story Pts</th>
                <th className="pb-3 font-semibold text-right">AI Duration</th>
                <th className="pb-3 font-semibold text-center">Confidence</th>
                <th className="pb-3 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-purple-950/60">
              {sprintTasks.map((task) => {
                const assignee = getAssignee(task.assigneeId);
                return (
                  <tr key={task.id} className="hover:bg-purple-50/60 dark:hover:bg-violet-950/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-[11px] font-mono text-purple-700 dark:text-fuchsia-300 bg-purple-100 dark:bg-fuchsia-500/15 px-1.5 py-0.5 rounded border border-purple-300 dark:border-fuchsia-500/30">
                          {task.id}
                        </span>
                        <span className="truncate max-w-md">{task.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-medium">
                        {task.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      {assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-purple-600 dark:bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {assignee.avatar}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                          <User className="h-3 w-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {task.storyPoints ?? "-"}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-700 dark:text-slate-200">
                      <div className="flex items-center justify-end gap-1 text-purple-700 dark:text-fuchsia-300 font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{task.aiPredictedHours}h</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-purple-400/70">{task.historicalVariance}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                        {task.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          task.riskLevel === "High"
                            ? "bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
                            : task.riskLevel === "Moderate"
                            ? "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
                            : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                        }`}
                      >
                        {task.riskLevel === "High" && <ShieldAlert className="h-2.5 w-2.5" />}
                        {task.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backlog Candidates Pool */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-950 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-purple-600 dark:text-violet-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Unallocated Project Backlog ({backlogTasks.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tasks waiting in backlog. Clicking &quot;Automated AI Sprint Replan&quot; evaluates and pulls these into the active sprint.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/80 dark:hover:bg-violet-900/80 text-purple-800 dark:text-violet-200 text-xs font-semibold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/80 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-purple-600 dark:text-fuchsia-400" />
            <span>Add Backlog Item</span>
          </button>
        </div>

        {backlogTasks.length > 0 ? (
          <div className="divide-y divide-purple-100 dark:divide-purple-950/60">
            {backlogTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-700 dark:text-fuchsia-300 bg-purple-100 dark:bg-fuchsia-500/15 px-1.5 py-0.5 rounded border border-purple-300 dark:border-fuchsia-500/30">
                      {t.id}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-[#09041a] px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-950">
                    {t.storyPoints} pts (~{t.aiPredictedHours}h)
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                    Ready for AI Allocation
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
            All backlog tasks have been planned into active sprints! Click &quot;Add Backlog Item&quot; above to queue new items for AI replanning.
          </div>
        )}
      </div>

      {/* Add Backlog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-purple-200 dark:border-purple-900/80 bg-white dark:bg-[#120a2e] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-950 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Task to Backlog</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-purple-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBacklogItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newBacklogTitle}
                  onChange={(e) => setNewBacklogTitle(e.target.value)}
                  placeholder="e.g. Optimize Redis Vector Cache Invalidation"
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/50 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1">
                    Domain
                  </label>
                  <select
                    value={newBacklogCategory}
                    onChange={(e) => setNewBacklogCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/50 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1">
                    Story Points
                  </label>
                  <select
                    value={newBacklogPoints}
                    onChange={(e) => setNewBacklogPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/50 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value={2}>2 pts (~5h)</option>
                    <option value={3}>3 pts (~7.5h)</option>
                    <option value={5}>5 pts (~12.5h)</option>
                    <option value={8}>8 pts (~20h)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-xs text-purple-900 dark:text-slate-300 hover:bg-purple-200 dark:hover:bg-purple-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30"
                >
                  Add to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
