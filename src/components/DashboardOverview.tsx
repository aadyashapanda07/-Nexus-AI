import React from "react";
import { Sparkles, Brain, Zap, Users, MessageSquare, ArrowRight, TrendingDown, ArrowUpRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { Task, TeamMember, Sprint } from "@/types/nexus";
import { DashboardMetrics } from "@/components/DashboardMetrics";

interface DashboardOverviewProps {
  tasks: Task[];
  team: TeamMember[];
  sprint: Sprint;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  team,
  sprint,
  onNavigate,
}) => {
  const overloadedMembers = team.filter((m) => m.currentLoadHours > m.maxCapacityHours);

  const featureCards = [
    {
      id: "predict",
      title: "AI Duration Predictor",
      tagline: "Predictive Machine Learning Regression",
      description:
        "Input any task description or user story to generate instant duration forecasts (hours & story points), confidence intervals, and risk breakdowns powered by Python FastAPI.",
      icon: Brain,
      iconBg: "from-cyan-500 to-blue-600",
      badge: "FastAPI ML Model",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      buttonText: "Open AI Predictor",
      stats: "94% Avg Confidence • Sub-15ms Latency",
    },
    {
      id: "sprint",
      title: "Automated Sprint Planner",
      tagline: "Velocity-Driven Capacity Balancing",
      description:
        "Automates sprint commitments by matching team velocity against backlog priority. Prevents over-committing and keeps sprints on track for 94.8% delivery predictability.",
      icon: Zap,
      iconBg: "from-indigo-500 to-purple-600",
      badge: `${sprint.allocatedPoints} / ${sprint.capacityPoints} pts`,
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      buttonText: "Open Sprint Planner",
      stats: `${tasks.filter((t) => t.sprintId === sprint.id).length} Active Sprint Tasks`,
    },
    {
      id: "workload",
      title: "Real-Time Team Workload",
      tagline: "Capacity Heatmap & 1-Click Rebalancer",
      description:
        "Live SVG gauges tracking 5 engineers against 40-hour thresholds. Highlights bottlenecks with an automated 1-click AI rebalance button that redistributes tasks to available peers.",
      icon: Users,
      iconBg: "from-purple-500 to-pink-600",
      badge: overloadedMembers.length > 0 ? `${overloadedMembers.length} Over-Allocated` : "Balanced",
      badgeColor:
        overloadedMembers.length > 0
          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      buttonText: "Open Team Workload",
      stats: "5 Active Engineers Tracked",
    },
    {
      id: "copilot",
      title: "Natural Language Query",
      tagline: "Pinecone RAG & GPT-4 Copilot",
      description:
        "Ask plain-English questions about team bandwidth, blockers, or delivery dates. Leverages Pinecone vector retrieval and GPT-4 synthesis to provide cited, actionable answers.",
      icon: MessageSquare,
      iconBg: "from-emerald-500 to-teal-600",
      badge: "RAG Semantic Search",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      buttonText: "Open Project Copilot",
      stats: "Sub-100ms Pinecone Semantic Search",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0b1329] to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Intelligent Task Management Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">Nexus AI</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            An intelligent ecosystem that uses predictive AI to optimize team velocity and automate workflow assignments. Beta teams achieved a verified <strong className="text-cyan-300 font-semibold">40% reduction in delivery time</strong>.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI (:8000)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Next.js 14 (:3000)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              OpenAI GPT-4
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Pinecone Vector DB
            </span>
          </div>
        </div>
      </div>

      {/* Top Key Metrics Row */}
      <DashboardMetrics tasks={tasks} team={team} sprint={sprint} />

      {/* Separate Tools Navigation Hub (Feature 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Core Application Modules</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any tool below to launch its dedicated, full-screen management interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="group relative rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 hover:border-cyan-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {card.title}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">{card.tagline}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {card.stats}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sprint 24 Snapshot & Velocity Telemetry */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Sprint Snapshot</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sprint 24: Predictive Velocity Engine • 40% Delivery Acceleration in Effect</p>
          </div>
          <button
            onClick={() => onNavigate("sprint")}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>View Full Sprint Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Velocity Commitment</span>
            <div className="text-2xl font-bold text-white mt-1">{sprint.allocatedPoints} / {sprint.capacityPoints} pts</div>
            <span className="text-[10px] text-emerald-400 font-medium">Safe Workload Budget</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Historical Reduction</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">-40% Days</div>
            <span className="text-[10px] text-slate-400 font-medium">14.2d down to 8.5d cycle</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Engine Status</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">100% Live</div>
            <span className="text-[10px] text-slate-400 font-medium">FastAPI + Pinecone RAG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
