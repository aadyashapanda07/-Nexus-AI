"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Database, Activity, Key, Check, X, LayoutDashboard, Sun, Moon } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
}) => {
  const [fastApiLive, setFastApiLive] = useState(false);
  const [openAiActive, setOpenAiActive] = useState(false);
  const [pineconeActive, setPineconeActive] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [openaiKey, setOpenaiKey] = useState("");
  const [pineconeKey, setPineconeKey] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isLight = theme === "light";

  const checkHealth = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/health");
      if (res.ok) {
        const data = await res.json();
        setFastApiLive(data.fastapi_live);
        setOpenAiActive(data.openai_configured);
        setPineconeActive(data.pinecone_configured);
      }
    } catch {
      setFastApiLive(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openai_api_key: openaiKey || undefined,
          pinecone_api_key: pineconeKey || undefined,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        await checkHealth();
        setTimeout(() => {
          setSaveSuccess(false);
          setShowConfigModal(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingKey(false);
    }
  };

  const tabs = [
    { id: "predict", label: "AI Duration Predictor" },
    { id: "sprint", label: "Sprint Planner" },
    { id: "workload", label: "Team Workload" },
    { id: "copilot", label: "Natural Language Query" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md px-4 sm:px-6 py-3 transition-colors duration-300 ${
          isLight
            ? "bg-white/90 border-purple-200/80 shadow-sm shadow-purple-500/5 text-slate-900"
            : "border-violet-950/80 bg-[#080414]/95 text-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          
          {/* Brand Logo Box: Clicking this opens Dashboard */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`group text-left rounded-2xl border p-2.5 sm:px-4 sm:py-2 transition-all duration-300 flex items-center gap-3.5 cursor-pointer select-none ${
              isLight
                ? activeTab === "overview"
                  ? "border-purple-400 bg-purple-100/90 shadow-md shadow-purple-500/15"
                  : "border-purple-200/80 bg-purple-50/60 hover:border-purple-400 hover:bg-purple-100/50"
                : activeTab === "overview"
                ? "border-violet-500/70 bg-gradient-to-r from-violet-950/60 via-purple-950/50 to-[#0d0724] shadow-lg shadow-violet-600/25"
                : "border-purple-950/80 bg-gradient-to-r from-[#100928]/90 via-[#0e0722]/80 to-[#0a0518] hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-900/30"
            }`}
            title="Click to open Dashboard"
          >
            {/* Glowing Logo Icon */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/35 group-hover:scale-105 transition-transform duration-300 shrink-0 text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            {/* Brand Names & Ecosystem Subtext */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base tracking-tight transition-colors ${
                  isLight ? "text-purple-950 group-hover:text-purple-700" : "text-white group-hover:text-violet-300"
                }`}>
                  Nexus <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">AI</span>
                </span>
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "bg-purple-100 text-purple-700 border-purple-300"
                    : "bg-violet-500/15 text-violet-300 border-violet-500/30"
                }`}>
                  ECOSYSTEM
                </span>
                {activeTab === "overview" && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isLight
                      ? "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300"
                      : "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"
                  }`}>
                    <LayoutDashboard className="h-2.5 w-2.5" />
                    Dashboard
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-medium transition-colors ${
                isLight ? "text-purple-900/70 group-hover:text-purple-950" : "text-slate-400 group-hover:text-slate-300"
              }`}>
                Predictive Velocity &amp; Workflow Automation
              </p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-3 justify-between xl:justify-end">
            <nav className={`flex flex-wrap items-center gap-1 p-1.5 rounded-2xl border transition-colors ${
              isLight
                ? "bg-purple-50/80 border-purple-200"
                : "bg-[#100826]/90 border-purple-950/80"
            }`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30"
                      : isLight
                      ? "text-purple-900/70 hover:text-purple-950 hover:bg-purple-200/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-violet-950/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Telemetry badges & Controls */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  isLight
                    ? fastApiLive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                    : fastApiLive
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
                title="Python FastAPI Backend on port 8000"
              >
                <Activity className={`h-3.5 w-3.5 ${fastApiLive ? "animate-pulse text-emerald-500" : ""}`} />
                <span>FastAPI {fastApiLive ? ":8000" : "Off"}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  isLight
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-purple-950/60 text-purple-300 border-purple-900/60"
                }`}
              >
                <Brain className="h-3.5 w-3.5 text-purple-600" />
                <span>{openAiActive ? "GPT-4" : "GPT-4"}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  isLight
                    ? "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200"
                    : "bg-purple-950/60 text-fuchsia-300 border-purple-900/60"
                }`}
              >
                <Database className="h-3.5 w-3.5 text-fuchsia-600" />
                <span>{pineconeActive ? "Pinecone" : "Pinecone"}</span>
              </div>

              <button
                onClick={() => setShowConfigModal(true)}
                className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                  isLight
                    ? "bg-white hover:bg-purple-50 text-purple-900 border-purple-200"
                    : "bg-purple-950/60 hover:bg-violet-900/60 text-violet-200 border-purple-800/60"
                }`}
                title="Configure Cloud Keys"
              >
                <Key className="h-3.5 w-3.5 text-purple-600" />
                <span>Keys</span>
              </button>

              {/* Light/Dark Mode Switcher Button */}
              <button
                onClick={toggleTheme}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                  isLight
                    ? "bg-purple-100 hover:bg-purple-200/80 text-purple-900 border-purple-300 shadow-sm"
                    : "bg-purple-950/80 hover:bg-violet-900/70 text-violet-200 border-purple-800/80"
                }`}
                title={isLight ? "Switch to Dark Mode (Electric Violet)" : "Switch to Light Mode (Purple & White)"}
              >
                {isLight ? (
                  <>
                    <Moon className="h-3.5 w-3.5 text-purple-700" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-300" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl space-y-4 ${
            isLight
              ? "bg-white border-purple-200 text-slate-800"
              : "border-purple-900/80 bg-[#120a2e] text-slate-100"
          }`}>
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-950 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-purple-600 dark:text-fuchsia-400" />
                <h3 className="text-sm font-bold">Live Cloud API Keys (Optional)</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-purple-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
              FastAPI is running locally on port 8000 with local semantic caching and regression duration algorithms. To connect live cloud OpenAI &amp; Pinecone APIs, enter your keys:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-purple-900 dark:text-violet-300">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-purple-500 ${
                    isLight
                      ? "bg-purple-50/50 border-purple-200 text-slate-800 placeholder-slate-400"
                      : "bg-[#09041a] border-purple-900/60 text-white placeholder-slate-600"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-purple-900 dark:text-violet-300">
                  Pinecone API Key
                </label>
                <input
                  type="password"
                  value={pineconeKey}
                  onChange={(e) => setPineconeKey(e.target.value)}
                  placeholder="pcsk_..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-purple-500 ${
                    isLight
                      ? "bg-purple-50/50 border-purple-200 text-slate-800 placeholder-slate-400"
                      : "bg-[#09041a] border-purple-900/60 text-white placeholder-slate-600"
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className={`px-3 py-2 rounded-xl text-xs ${
                    isLight
                      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      : "bg-purple-950/80 text-slate-300 hover:bg-purple-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>{isSavingKey ? "Connecting..." : "Save to FastAPI"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
