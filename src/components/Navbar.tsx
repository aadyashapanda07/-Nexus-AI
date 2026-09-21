"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Database, Activity, Key, Check, X, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [fastApiLive, setFastApiLive] = useState(false);
  const [openAiActive, setOpenAiActive] = useState(false);
  const [pineconeActive, setPineconeActive] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [openaiKey, setOpenaiKey] = useState("");
  const [pineconeKey, setPineconeKey] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // 4 Core Tools (Dashboard is integrated into the clickable Brand Logo box)
  const tabs = [
    { id: "predict", label: "AI Duration Predictor" },
    { id: "sprint", label: "Sprint Planner" },
    { id: "workload", label: "Team Workload" },
    { id: "copilot", label: "Natural Language Query" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070b14]/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          
          {/* Brand Logo Box: Clicking this opens Dashboard */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`group text-left rounded-2xl border p-2.5 sm:px-4 sm:py-2 transition-all duration-300 flex items-center gap-3.5 cursor-pointer select-none ${
              activeTab === "overview"
                ? "border-cyan-500/60 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 shadow-lg shadow-cyan-500/15"
                : "border-slate-800/90 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/80 hover:border-cyan-500/40 hover:bg-slate-850"
            }`}
            title="Click to open Dashboard"
          >
            {/* Glowing Logo Icon */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            {/* Brand Names & Ecosystem Subtext */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Nexus <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  ECOSYSTEM
                </span>
                {activeTab === "overview" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <LayoutDashboard className="h-2.5 w-2.5" />
                    Dashboard Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                Predictive Velocity &amp; Workflow Automation
              </p>
            </div>
          </button>

          {/* Navigation Tabs - Clean, no horizontal slider/scrollbar */}
          <div className="flex flex-wrap items-center gap-3 justify-between xl:justify-end">
            <nav className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Telemetry badges */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  fastApiLive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
                title="Python FastAPI Backend on port 8000"
              >
                <Activity className={`h-3.5 w-3.5 ${fastApiLive ? "animate-pulse" : ""}`} />
                <span>FastAPI {fastApiLive ? ":8000" : "Off"}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  openAiActive
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                <span>{openAiActive ? "GPT-4" : "GPT-4"}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  pineconeActive
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>{pineconeActive ? "Pinecone" : "Pinecone"}</span>
              </div>

              <button
                onClick={() => setShowConfigModal(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Configure Cloud Keys"
              >
                <Key className="h-3.5 w-3.5 text-cyan-400" />
                <span>Keys</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Cloud API Keys (Optional)</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI is running locally on port 8000 with local semantic caching and regression duration algorithms. To connect live cloud OpenAI &amp; Pinecone APIs, enter your keys:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Pinecone API Key
                </label>
                <input
                  type="password"
                  value={pineconeKey}
                  onChange={(e) => setPineconeKey(e.target.value)}
                  placeholder="pcsk_..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5"
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
