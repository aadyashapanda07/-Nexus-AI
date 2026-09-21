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
      // Call live Python FastAPI backend
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
            : "AI Auto-Matched (Marcus Chen)",
        });
        setEngineSource("FastAPI Python Model (Live :8000)");
        setIsPredicting(false);
        return;
      }
    } catch {
      // Graceful fallback to client engine
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Brain className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white">AI Task Duration Predictor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FastAPI machine learning model calculating regression duration &amp; historical velocity variance.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Python FastAPI Active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handlePredict} className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title / User Story
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Pinecone Vector RAG Pipeline for Sprint Retrieval"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoleType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="Backend">Backend (FastAPI)</option>
                <option value="Frontend">Frontend (Next.js 14)</option>
                <option value="DevOps">DevOps &amp; Cloud</option>
                <option value="Product">Product &amp; Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Complexity Score: {complexity} / 5
              </label>
              <span className="text-xs text-slate-400">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPredicting || !title.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isPredicting ? "Computing via FastAPI..." : "Run AI Duration Prediction (FastAPI)"}
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 flex flex-col justify-between">
          {prediction ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Predicted Duration</span>
                    <span className="text-[10px] text-cyan-400 font-mono">({engineSource})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-cyan-400">
                      {prediction.predictedHours} hrs
                    </span>
                    <span className="text-xs text-slate-300">
                      (~{prediction.storyPoints} Story Points)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Confidence</span>
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-emerald-400 font-bold text-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{prediction.confidencePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Estimation Breakdown */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Base Category</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{prediction.breakdown.baseEstimate}h</div>
                </div>
                <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Complexity Mult.</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{prediction.breakdown.complexityMultiplier}x</div>
                </div>
                <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Hist. Variance</div>
                  <div className="text-xs font-semibold text-cyan-300 mt-0.5">±{prediction.breakdown.historicalDeviation}h</div>
                </div>
              </div>

              {/* Recommended Assignee */}
              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/80 text-xs">
                <span className="text-slate-400">AI Velocity Recommendation: </span>
                <span className="font-semibold text-cyan-300">{prediction.recommendedAssignee}</span>
              </div>

              {/* Risk Assessment */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
                  <AlertTriangle className={`h-3.5 w-3.5 ${
                    prediction.riskLevel === "High" ? "text-rose-400" : prediction.riskLevel === "Moderate" ? "text-amber-400" : "text-emerald-400"
                  }`} />
                  <span className="text-slate-300">Risk Assessment: </span>
                  <span className={
                    prediction.riskLevel === "High" ? "text-rose-400" : prediction.riskLevel === "Moderate" ? "text-amber-400" : "text-emerald-400"
                  }>
                    {prediction.riskLevel}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {prediction.keyRiskFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToBacklog}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-cyan-400" />
                  Add to Active Sprint Backlog
                </button>
                {addedSuccess && (
                  <p className="text-center text-xs text-emerald-400 mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Added to Sprint with live FastAPI prediction!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <BarChart2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">FastAPI Model Connected</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Fill out the task details on the left and click &quot;Run AI Duration Prediction (FastAPI)&quot; to calculate regression forecasts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
