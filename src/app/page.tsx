"use client";

import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sprint, setSprint] = useState<Sprint>(initialSprint);
  const [rebalancedNotice, setRebalancedNotice] = useState<string | null>(null);

  // Synchronize HTML element class with theme state
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isLight = theme === "light";

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
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isLight
          ? "bg-[#faf8ff] text-slate-900 selection:bg-purple-200 selection:text-purple-900"
          : "bg-[#080414] text-slate-100 selection:bg-purple-600/30 selection:text-purple-200"
      }`}
    >
      {/* Top Navbar with Logo Box and Theme Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb when inside any specific tool */}
        {activeTab !== "overview" && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? "text-purple-900 bg-white hover:bg-purple-50 border-purple-200 shadow-purple-500/5"
                  : "text-purple-300 bg-[#110829] hover:bg-[#190c3d] border-purple-900/60"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <div className={`flex items-center gap-1.5 text-xs font-mono ${
              isLight ? "text-purple-800" : "text-purple-400/80"
            }`}>
              <HomeIcon className="h-3 w-3" />
              <span>Dashboard</span>
              <span>/</span>
              <span className={`font-semibold uppercase ${
                isLight ? "text-purple-700" : "text-fuchsia-400"
              }`}>
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

        {/* 1. Dashboard Overview */}
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

      <footer className={`border-t py-6 px-6 text-center text-xs transition-colors ${
        isLight
          ? "border-purple-200 bg-white text-purple-800/80"
          : "border-purple-950/80 bg-[#080414] text-purple-400/70"
      }`}>
        <p>Nexus AI Task Management Ecosystem • Powered by Next.js 14, FastAPI, GPT-4 &amp; Pinecone</p>
      </footer>
    </div>
  );
}
