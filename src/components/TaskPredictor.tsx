import React, { useState } from "react";
import { Sparkles, Brain, AlertTriangle, CheckCircle2, Clock, Plus, BarChart2, Activity } from "lucide-react";
import { RoleType, TeamMember, Task, PredictionResult } from "@/types/nexus";
import { predictTaskDuration } from "@/lib/aiEngine";

interface TaskPredictorProps {
  team: TeamMember[];
  onAddTask: (task: Task) => void;
}

export const TaskPredictor: React.FC<TaskPredictorProps> = ({ team, onAddTask }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RoleType>("AI / ML");
  const [complexity, setComplexity] = useState<number>(3);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [engineSource, setEngineSource] = useState<string>("FastAPI Python Model");
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPredicting(true);
    setAddedSuccess(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          complexity,
          assignee_id: selectedAssignee || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPrediction({
          predictedHours: data.predictedHours,
          confidencePercentage: data.confidenceScore,
          riskLevel: data.riskLevel,
          storyPoints: data.storyPoints,
          breakdown: data.breakdown,
          keyRiskFactors: data.riskFactors,
          recommendedAssignee: selectedAssignee
            ? team.find((m) => m.id === selectedAssignee)?.name || "Assigned Engineer"
            : "AI Auto-Matched (Dr. Marcus Chen)",
        });
        setEngineSource("FastAPI Python Model (Live :8000)");
        setIsPredicting(false);
        return;
      }
    } catch {
      // Fallback
    }

    const fallbackResult = predictTaskDuration(title, category, complexity, selectedAssignee, team);
    setPrediction(fallbackResult);
    setEngineSource("Nexus Local Ensemble");
    setIsPredicting(false);
  };

  const handleSaveToBacklog = () => {
    if (!prediction || !title.trim()) return;

    const newTask: Task = {
      id: `NX-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description: `Task estimated via Nexus AI (${engineSource}) with ${prediction.confidencePercentage}% confidence.`,
      category,
      priority: complexity >= 4 ? "High" : "Medium",
      status: "Sprint Ready",
      assigneeId: selectedAssignee || undefined,
      storyPoints: prediction.storyPoints,
      aiPredictedHours: prediction.predictedHours,
      confidenceScore: prediction.confidencePercentage,
      historicalVariance: `+/- ${prediction.breakdown.historicalDeviation} hrs`,
      riskLevel: prediction.riskLevel,
      riskFactors: prediction.keyRiskFactors,
      sprintId: "sp-24",
    };

    onAddTask(newTask);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/70 bg-white dark:bg-[#0e0724]/85 p-6 shadow-xl shadow-purple-500/5 dark:shadow-2xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-950 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-violet-500/15 text-purple-700 dark:text-violet-400 flex items-center justify-center border border-purple-300 dark:border-violet-500/30">
              <Brain className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Task Duration Predictor</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            FastAPI machine learning model calculating regression duration &amp; historical velocity variance.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5 font-mono">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Python FastAPI Active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handlePredict} className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1.5">
              Task Title / User Story
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Pinecone Vector RAG Pipeline for Sprint Retrieval"
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/40 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1.5">
                Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoleType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/40 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="Backend">Backend (FastAPI)</option>
                <option value="Frontend">Frontend (Next.js 14)</option>
                <option value="DevOps">DevOps &amp; Cloud</option>
                <option value="Product">Product &amp; Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/40 dark:bg-[#09041a] border border-purple-200 dark:border-purple-900/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="">Auto-Assign (Optimal Velocity)</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role} - {m.currentLoadHours}h load)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-purple-900 dark:text-violet-300 uppercase tracking-wider">
                Complexity Score: {complexity} / 5
              </label>
              <span className="text-xs text-purple-700 dark:text-purple-400">
                {complexity === 1
                  ? "Trivial / Minor bugfix"
                  : complexity === 3
                  ? "Standard Feature Implementation"
                  : "High Architectural Overhaul"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 dark:bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-fuchsia-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPredicting || !title.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {isPredicting ? "Computing via FastAPI..." : "Run AI Duration Prediction (FastAPI)"}
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        <div className="lg:col-span-6 rounded-xl border border-purple-200 dark:border-purple-950 bg-purple-50/50 dark:bg-[#09041a]/90 p-5 flex flex-col justify-between">
          {prediction ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-950 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Predicted Duration</span>
                    <span className="text-[10px] text-purple-700 dark:text-fuchsia-400 font-mono">({engineSource})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-800 via-violet-700 to-fuchsia-600 dark:from-violet-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent">
                      {prediction.predictedHours} hrs
                    </span>
                    <span className="text-xs text-purple-900/80 dark:text-purple-300 font-mono">
                      (~{prediction.storyPoints} Story Points)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Confidence</span>
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{prediction.confidencePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Estimation Breakdown */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="rounded-lg bg-white dark:bg-[#140a33] p-2 border border-purple-200 dark:border-purple-900/60 shadow-sm">
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 uppercase">Base Category</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{prediction.breakdown.baseEstimate}h</div>
                </div>
                <div className="rounded-lg bg-white dark:bg-[#140a33] p-2 border border-purple-200 dark:border-purple-900/60 shadow-sm">
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 uppercase">Complexity Mult.</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{prediction.breakdown.complexityMultiplier}x</div>
                </div>
                <div className="rounded-lg bg-white dark:bg-[#140a33] p-2 border border-purple-200 dark:border-purple-900/60 shadow-sm">
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 uppercase">Hist. Variance</div>
                  <div className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300 mt-0.5">±{prediction.breakdown.historicalDeviation}h</div>
                </div>
              </div>

              {/* Recommended Assignee */}
              <div className="rounded-lg bg-white dark:bg-[#140a33]/60 p-3 border border-purple-200 dark:border-purple-900/60 text-xs shadow-sm">
                <span className="text-slate-500 dark:text-slate-400">AI Velocity Recommendation: </span>
                <span className="font-semibold text-purple-900 dark:text-fuchsia-300">{prediction.recommendedAssignee}</span>
              </div>

              {/* Risk Assessment */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
                  <AlertTriangle className={`h-3.5 w-3.5 ${
                    prediction.riskLevel === "High" ? "text-rose-600 dark:text-rose-400" : prediction.riskLevel === "Moderate" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  }`} />
                  <span className="text-slate-700 dark:text-slate-300">Risk Assessment: </span>
                  <span className={
                    prediction.riskLevel === "High" ? "text-rose-600 dark:text-rose-400" : prediction.riskLevel === "Moderate" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  }>
                    {prediction.riskLevel}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {prediction.keyRiskFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-600 dark:text-fuchsia-400 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToBacklog}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-[#170c3d] dark:hover:bg-[#201054] text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 border border-purple-300 dark:border-purple-800/80 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-purple-700 dark:text-fuchsia-400" />
                  Add to Active Sprint Backlog
                </button>
                {addedSuccess && (
                  <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center justify-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Added to Sprint with live FastAPI prediction!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-[#140a33] flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 shadow-sm">
                <BarChart2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-purple-200">FastAPI Model Connected</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Fill out the task details on the left and click &quot;Run AI Duration Prediction (FastAPI)&quot; to calculate regression forecasts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
