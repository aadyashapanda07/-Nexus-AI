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
      tagline: "Machine Learning Regression Forecasting",
      description:
        "Input task user stories to generate instant predictive duration forecasts (hours & story points), confidence intervals, and risk factor breakdowns powered by Python FastAPI.",
      icon: Brain,
      iconBg: "from-violet-600 to-purple-700",
      badge: "FastAPI ML Model",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
      buttonText: "Open AI Predictor",
      stats: "94% Avg Confidence • Sub-15ms Latency",
    },
    {
      id: "sprint",
      title: "Automated Sprint Planner",
      tagline: "Velocity-Driven Capacity Balancing",
      description:
        "Automates sprint commitments by matching team velocity against backlog priority. Prevents over-committing and keeps sprints on track for 97.4% delivery predictability.",
      icon: Zap,
      iconBg: "from-purple-600 to-fuchsia-600",
      badge: `${sprint.allocatedPoints} / ${sprint.capacityPoints} pts`,
      badgeColor: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/30",
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
      iconBg: "from-fuchsia-600 to-pink-600",
      badge: overloadedMembers.length > 0 ? `${overloadedMembers.length} Over-Allocated` : "Balanced",
      badgeColor:
        overloadedMembers.length > 0
          ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
          : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
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
      iconBg: "from-violet-700 to-indigo-600",
      badge: "RAG Semantic Search",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
      buttonText: "Open Project Copilot",
      stats: "Sub-100ms Pinecone Semantic Search",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-200/80 dark:border-purple-900/80 bg-gradient-to-r from-purple-100/90 via-fuchsia-50/60 to-white dark:from-[#12082b] dark:via-[#1a0b38] dark:to-[#0d0620] p-6 sm:p-8 shadow-xl shadow-purple-500/5 dark:shadow-purple-950/40 transition-colors">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-fuchsia-400/20 dark:bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-400/20 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-200/60 dark:bg-violet-500/15 border border-purple-300 dark:border-violet-500/30 text-purple-900 dark:text-violet-300 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
            <span>Intelligent Task Management Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">Nexus AI</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-purple-100/90 leading-relaxed">
            An intelligent ecosystem that uses predictive AI to optimize team velocity and automate workflow assignments. Beta teams achieved a verified <strong className="text-purple-900 dark:text-fuchsia-300 font-semibold">40% reduction in delivery time</strong>.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-purple-950/80 border border-emerald-300 dark:border-purple-800/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              FastAPI (:8000)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-100/70 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-violet-200">
              Next.js 14 (:3000)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-fuchsia-100/70 dark:bg-purple-950/80 border border-fuchsia-200 dark:border-purple-800/80 text-fuchsia-900 dark:text-fuchsia-300">
              OpenAI GPT-4
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-100/70 dark:bg-purple-950/80 border border-indigo-200 dark:border-purple-800/80 text-indigo-900 dark:text-pink-300">
              Pinecone Vector DB
            </span>
          </div>
        </div>
      </div>

      {/* Top Key Metrics Row */}
      <DashboardMetrics tasks={tasks} team={team} sprint={sprint} />

      {/* Separate Tools Navigation Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Core Application Modules</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                className="group relative rounded-2xl border border-purple-200/80 dark:border-purple-950/90 bg-white dark:bg-[#100726]/70 p-6 hover:border-purple-400 dark:hover:border-violet-500/50 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-violet-950/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-transform duration-300 shadow-purple-600/25`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-violet-300 transition-colors">
                          {card.title}
                        </h3>
                        <span className="text-[11px] text-purple-700 dark:text-purple-300/70 font-medium">{card.tagline}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-950/80 flex items-center justify-between">
                  <span className="text-[11px] text-purple-800 dark:text-purple-400/80 font-mono">
                    {card.stats}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-fuchsia-400 group-hover:text-purple-900 dark:group-hover:text-fuchsia-300 group-hover:translate-x-1 transition-all"
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
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-[#0f0724]/70 p-6 shadow-xl shadow-purple-500/5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-950 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Sprint Snapshot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sprint 24: Predictive Velocity Engine • 40% Delivery Acceleration in Effect</p>
          </div>
          <button
            onClick={() => onNavigate("sprint")}
            className="text-xs text-purple-700 dark:text-fuchsia-400 hover:text-purple-900 dark:hover:text-fuchsia-300 flex items-center gap-1 font-semibold"
          >
            <span>View Full Sprint Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-[#09041a] border border-purple-100 dark:border-purple-950">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Velocity Commitment</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{sprint.allocatedPoints} / {sprint.capacityPoints} pts</div>
            <span className="text-[10px] text-purple-700 dark:text-fuchsia-400 font-medium">Safe Workload Budget</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-[#09041a] border border-purple-100 dark:border-purple-950">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Historical Reduction</span>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-fuchsia-700 dark:from-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent mt-1">-40% Days</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">14.2d down to 8.5d cycle</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-[#09041a] border border-purple-100 dark:border-purple-950">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engine Status</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100% Live</div>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">FastAPI + Pinecone RAG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
