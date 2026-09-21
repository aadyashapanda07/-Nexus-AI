import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, ArrowRight, Bot, User, Activity } from "lucide-react";
import { Task, TeamMember, CopilotMessage } from "@/types/nexus";
import { processNaturalLanguageQuery } from "@/lib/aiEngine";

interface NaturalLanguageQueryProps {
  tasks: Task[];
  team: TeamMember[];
}

export const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({ tasks, team }) => {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      sender: "nexus-ai",
      timestamp: "Just now",
      text: "Hello! I am your Nexus AI Project Copilot connected to the Python FastAPI backend with Pinecone RAG semantic search and GPT-4 context graph. Ask me anything about sprint velocity, team overload, or task duration bottlenecks.",
    },
  ]);
  const [isSearching, setIsSearching] = useState(false);

  const sampleQueries = [
    "Who on the engineering team is currently overloaded?",
    "Which tasks are at high risk in this sprint?",
    "How was the 40% delivery time reduction achieved?",
    "Show status of Pinecone vector embedding tasks",
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsSearching(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          tasks,
          team,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: CopilotMessage = {
          id: `ai-${Date.now()}`,
          sender: "nexus-ai",
          timestamp: "Just now",
          text: data.answer,
          citedTasks: data.citedTasks || [],
          actionRecommendation: data.actionRecommendation,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsSearching(false);
        return;
      }
    } catch {
      // Fallback
    }

    const localResponse = processNaturalLanguageQuery(q, tasks, team);
    const fallbackMsg: CopilotMessage = {
      id: `ai-${Date.now()}`,
      sender: "nexus-ai",
      timestamp: "Just now",
      text: localResponse.answer,
      citedTasks: localResponse.citedTasks,
      actionRecommendation: localResponse.actionRecommendation,
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    setIsSearching(false);
  };

  return (
    <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl flex flex-col h-[640px] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-950 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-500/30">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Natural Language Project Querying</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live FastAPI RAG pipeline querying Pinecone embeddings &amp; GPT-4 context graph.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>FastAPI RAG Live</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sampleQueries.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sample)}
            className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-purple-50/60 dark:bg-[#09041a] border border-purple-200 dark:border-purple-950 text-purple-900/80 dark:text-purple-300/80 hover:text-purple-950 dark:hover:text-fuchsia-300 hover:border-purple-400 dark:hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{sample}</span>
            <ArrowRight className="h-2.5 w-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-fuchsia-600 text-white"
                  : "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30"
              }`}
            >
              {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-purple-100 text-purple-950 border border-purple-300 dark:bg-purple-950/60 dark:border-violet-500/40 dark:text-purple-100"
                  : "bg-purple-50/70 border border-purple-200 text-slate-800 dark:bg-[#09041a]/90 dark:border-purple-950 dark:text-slate-200"
              }`}
            >
              <p>{msg.text}</p>

              {/* Cited Tasks */}
              {msg.citedTasks && msg.citedTasks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-purple-200 dark:border-purple-950 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-semibold text-purple-800 dark:text-purple-300">Cited Records:</span>
                  {msg.citedTasks.map((taskId) => (
                    <span
                      key={taskId}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/30 font-semibold"
                    >
                      {taskId}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Recommendation */}
              {msg.actionRecommendation && (
                <div className="mt-2.5 rounded-lg bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 dark:bg-purple-950/70 dark:border-fuchsia-500/30 dark:text-fuchsia-200 p-2 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400 shrink-0" />
                  <span>AI Action: {msg.actionRecommendation}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isSearching && (
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs shadow-md shadow-purple-600/30">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl p-3.5 bg-purple-50 dark:bg-[#09041a]/90 border border-purple-200 dark:border-purple-950 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <span className="animate-spin text-fuchsia-600 dark:text-fuchsia-400">✦</span>
              <span>Calling FastAPI RAG pipeline (Pinecone &amp; GPT-4)...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything about the project, team load, velocity, or tasks..."
          className="w-full pl-4 pr-12 py-3 rounded-xl bg-purple-50/40 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isSearching}
          className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex items-center justify-center disabled:opacity-40 transition-opacity cursor-pointer shadow-md shadow-purple-600/30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
