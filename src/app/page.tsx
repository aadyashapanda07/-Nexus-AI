"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { TaskPredictor } from "@/components/TaskPredictor";
import { SprintPlanner } from "@/components/SprintPlanner";
import { TeamWorkload } from "@/components/TeamWorkload";
import { NaturalLanguageQuery } from "@/components/NaturalLanguageQuery";
import { initialTeamMembers, initialTasks, initialSprint } from "@/lib/nexusData";
import { Task, TeamMember, Sprint } from "@/types/nexus";
import { rebalanceTeamWorkload } from "@/lib/aiEngine";
import { ArrowLeft, Home as HomeIcon } from "lucide-react";

export default function Home() {
  // Default to Dashboard Overview (accessed by clicking Logo Box)
  const [activeTab, setActiveTab] = useState("overview");
  const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sprint, setSprint] = useState<Sprint>(initialSprint);
  const [rebalancedNotice, setRebalancedNotice] = useState<string | null>(null);

  // Add task to sprint
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);

    if (newTask.storyPoints) {
      setSprint((prev) => ({
        ...prev,
        allocatedPoints: prev.allocatedPoints + (newTask.storyPoints || 0),
      }));
    }

    if (newTask.assigneeId) {
      setTeam((prev) =>
        prev.map((m) =>
          m.id === newTask.assigneeId
            ? {
                ...m,
                currentLoadHours: Number((m.currentLoadHours + newTask.aiPredictedHours).toFixed(1)),
                status:
                  m.currentLoadHours + newTask.aiPredictedHours > m.maxCapacityHours
                    ? "overloaded"
                    : m.currentLoadHours + newTask.aiPredictedHours >= m.maxCapacityHours * 0.85
                    ? "warning"
                    : "optimal",
              }
            : m
        )
      );
    }
  };

  // Workload rebalancer using FastAPI
  const handleRebalance = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team, tasks }),
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(data.updatedTeam);
        setTasks(data.updatedTasks);
        setRebalancedNotice(`[FastAPI :8000] ${data.message}`);
        setTimeout(() => setRebalancedNotice(null), 6000);
        return;
      }
    } catch {
      // Fallback
    }

    const result = rebalanceTeamWorkload(team, tasks);
    setTeam(result.updatedTeam);
    setTasks(result.updatedTasks);

    if (result.rebalancedCount > 0) {
      setRebalancedNotice(
        `AI successfully redistributed ${result.rebalancedCount} task(s) to available peers.`
      );
    } else {
      setRebalancedNotice(
        "AI workload analysis complete: team distribution is currently optimal."
      );
    }

    setTimeout(() => {
      setRebalancedNotice(null);
    }, 6000);
  };

  // Live Sprint Updated handler (called by SprintPlanner with FastAPI result)
  const handleSprintUpdated = (
    updatedSprint: Sprint,
    updatedTasks: Task[],
    updatedTeam: TeamMember[],
    message: string
  ) => {
    setSprint(updatedSprint);
    setTasks(updatedTasks);
    setTeam(updatedTeam);
    setRebalancedNotice(`[FastAPI :8000] ${message}`);
    setTimeout(() => setRebalancedNotice(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navbar with Logo Box (opens Dashboard) and 4 direct tool tabs */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb when inside any specific tool */}
        {activeTab !== "overview" && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <HomeIcon className="h-3 w-3" />
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-cyan-400 font-semibold uppercase">
                {activeTab === "predict"
                  ? "AI Duration Predictor"
                  : activeTab === "sprint"
                  ? "Sprint Planner"
                  : activeTab === "workload"
                  ? "Team Workload"
                  : "Natural Language Query"}
              </span>
            </div>
          </div>
        )}

        {/* 1. Dashboard Overview (Activated by clicking the Logo Box) */}
        {activeTab === "overview" && (
          <DashboardOverview
            tasks={tasks}
            team={team}
            sprint={sprint}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* 2. Dedicated AI Duration Predictor Page */}
        {activeTab === "predict" && (
          <div className="space-y-6">
            <TaskPredictor team={team} onAddTask={handleAddTask} />
          </div>
        )}

        {/* 3. Dedicated Sprint Planner Page with Live Workable AI Replan */}
        {activeTab === "sprint" && (
          <div className="space-y-6">
            <SprintPlanner
              sprint={sprint}
              tasks={tasks}
              team={team}
              onSprintUpdated={handleSprintUpdated}
            />
          </div>
        )}

        {/* 4. Dedicated Team Workload Page */}
        {activeTab === "workload" && (
          <div className="space-y-6">
            <TeamWorkload
              team={team}
              tasks={tasks}
              onRebalance={handleRebalance}
              rebalancedNotice={rebalancedNotice}
            />
          </div>
        )}

        {/* 5. Dedicated Natural Language Query Page */}
        {activeTab === "copilot" && (
          <div className="space-y-6">
            <NaturalLanguageQuery tasks={tasks} team={team} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#070b14] py-6 px-6 text-center text-xs text-slate-500">
        <p>Nexus AI Task Management Ecosystem • Powered by Next.js 14, FastAPI, GPT-4 &amp; Pinecone</p>
      </footer>
    </div>
  );
}
