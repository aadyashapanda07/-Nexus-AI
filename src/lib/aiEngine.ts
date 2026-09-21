import { Task, TeamMember, PredictionResult, RoleType } from "@/types/nexus";

/**
 * Predicts task duration based on title, category, complexity score, and historical team velocity
 */
export function predictTaskDuration(
  title: string,
  category: RoleType,
  complexity: number, // 1 to 5
  assigneeId?: string,
  teamMembers: TeamMember[] = []
): PredictionResult {
  // Base duration mapping by role category in hours
  const baseCategoryHours: Record<RoleType, number> = {
    Frontend: 6.0,
    Backend: 7.5,
    "AI / ML": 10.0,
    DevOps: 5.5,
    Product: 4.0,
  };

  const base = baseCategoryHours[category] || 6.0;
  // Multiplier from complexity: 1 => 0.7x, 3 => 1.4x, 5 => 2.6x
  const complexityMultiplier = 0.5 + complexity * 0.42;

  // Assignee velocity factor: if assigned to member with high velocity, slight speedup
  let velocityFactor = 1.0;
  let recommendedAssignee = "Auto-match recommended";

  if (assigneeId) {
    const member = teamMembers.find((m) => m.id === assigneeId);
    if (member) {
      // higher velocity reduces time slightly
      velocityFactor = Math.max(0.75, 1.25 - member.avgVelocityPoints / 40);
      recommendedAssignee = member.name;
    }
  } else {
    // Recommend optimal available assignee for this category
    const candidates = teamMembers.filter((m) => m.role === category);
    if (candidates.length > 0) {
      // Pick the one with the least load
      const optimal = [...candidates].sort(
        (a, b) => a.currentLoadHours / a.maxCapacityHours - b.currentLoadHours / b.maxCapacityHours
      )[0];
      recommendedAssignee = optimal.name;
    }
  }

  // Calculate predicted hours with variance
  const calculatedHours = Number((base * complexityMultiplier * velocityFactor).toFixed(1));
  
  // Confidence score: higher for simpler tasks and well-matched categories
  const confidencePercentage = Math.min(97, Math.max(76, Math.round(98 - complexity * 3.5)));

  // Story points approximation (Fibonacci scale)
  const fibonacci = [1, 2, 3, 5, 8, 13, 21];
  const targetPt = calculatedHours / 2.5;
  const storyPoints = fibonacci.reduce((prev, curr) =>
    Math.abs(curr - targetPt) < Math.abs(prev - targetPt) ? curr : prev
  );

  const riskLevel: "Low" | "Moderate" | "High" =
    calculatedHours > 16 || complexity >= 4
      ? "High"
      : calculatedHours > 9
      ? "Moderate"
      : "Low";

  const keyRiskFactors: string[] = [];
  if (complexity >= 4) {
    keyRiskFactors.push("High architectural complexity requires cross-domain alignment");
  }
  if (category === "AI / ML") {
    keyRiskFactors.push("Pinecone vector query latency & token budget may induce jitter");
  }
  if (assigneeId) {
    const member = teamMembers.find((m) => m.id === assigneeId);
    if (member && member.currentLoadHours >= member.maxCapacityHours) {
      keyRiskFactors.push(`Assignee ${member.name} is currently at 100%+ capacity threshold`);
    }
  }

  if (keyRiskFactors.length === 0) {
    keyRiskFactors.push("Standard implementation pattern matches historical beta velocity");
  }

  return {
    predictedHours: calculatedHours,
    confidencePercentage,
    riskLevel,
    storyPoints,
    breakdown: {
      baseEstimate: base,
      complexityMultiplier: Number(complexityMultiplier.toFixed(2)),
      historicalDeviation: Number((calculatedHours * 0.12).toFixed(1)),
    },
    keyRiskFactors,
    recommendedAssignee,
  };
}

/**
 * Automatically rebalances team workload using AI capacity optimization
 */
export function rebalanceTeamWorkload(
  team: TeamMember[],
  tasks: Task[]
): { updatedTeam: TeamMember[]; updatedTasks: Task[]; rebalancedCount: number } {
  const updatedTeam = team.map((m) => ({ ...m }));
  const updatedTasks = tasks.map((t) => ({ ...t }));
  let rebalancedCount = 0;

  // Identify overloaded members (> 40 hrs)
  const overloaded = updatedTeam.filter((m) => m.currentLoadHours > m.maxCapacityHours);

  overloaded.forEach((heavyMember) => {
    // Find uncompleted tasks assigned to heavyMember
    const candidateTasks = updatedTasks.filter(
      (t) => t.assigneeId === heavyMember.id && t.status !== "Done"
    );

    candidateTasks.forEach((task) => {
      // Find candidate with matching role or available capacity
      const alternative = updatedTeam.find(
        (m) =>
          m.id !== heavyMember.id &&
          (m.role === task.category || m.role === "Backend") &&
          m.currentLoadHours + task.aiPredictedHours <= m.maxCapacityHours
      );

      if (alternative && heavyMember.currentLoadHours > heavyMember.maxCapacityHours) {
        // Reassign
        task.assigneeId = alternative.id;
        heavyMember.currentLoadHours = Math.max(
          0,
          Number((heavyMember.currentLoadHours - task.aiPredictedHours).toFixed(1))
        );
        alternative.currentLoadHours = Number(
          (alternative.currentLoadHours + task.aiPredictedHours).toFixed(1)
        );
        rebalancedCount++;
      }
    });
  });

  // Re-evaluate statuses
  updatedTeam.forEach((m) => {
    const ratio = m.currentLoadHours / m.maxCapacityHours;
    if (ratio > 1.0) m.status = "overloaded";
    else if (ratio >= 0.85) m.status = "warning";
    else m.status = "optimal";
  });

  return { updatedTeam, updatedTasks, rebalancedCount };
}

/**
 * Natural Language Query Engine (Simulating Pinecone Semantic Search + GPT-4 RAG)
 */
export function processNaturalLanguageQuery(
  query: string,
  tasks: Task[],
  team: TeamMember[]
): { answer: string; citedTasks: string[]; actionRecommendation?: string } {
  const q = query.toLowerCase();

  if (q.includes("overload") || q.includes("capacity") || q.includes("bandwidth") || q.includes("who is busy")) {
    const over = team.filter((m) => m.currentLoadHours >= m.maxCapacityHours);
    if (over.length > 0) {
      const names = over.map((m) => `${m.name} (${m.currentLoadHours}h / ${m.maxCapacityHours}h)`).join(", ");
      return {
        answer: `Nexus AI telemetry indicates ${over.length} team member(s) exceeding safe capacity limits: ${names}. Workload rebalancing is recommended to avoid delivery delay.`,
        citedTasks: tasks.filter((t) => over.some((o) => o.id === t.assigneeId)).map((t) => t.id),
        actionRecommendation: "Trigger 1-Click AI Rebalance in the Workload tab to automatically offload tasks.",
      };
    } else {
      return {
        answer: "All team members are currently within safe workload thresholds (< 100% capacity). Velocity is optimal.",
        citedTasks: [],
      };
    }
  }

  if (q.includes("risk") || q.includes("blocker") || q.includes("delay") || q.includes("critical")) {
    const riskyTasks = tasks.filter((t) => t.riskLevel === "High" || t.priority === "Critical");
    return {
      answer: `Found ${riskyTasks.length} high-risk or critical items in the active sprint. Primary bottlenecks include task NX-101 (Pinecone vector indexing) and unassigned high-complexity architectural tasks.`,
      citedTasks: riskyTasks.map((t) => t.id),
      actionRecommendation: "Assign an active pair programmer or split NX-101 into smaller sub-tasks.",
    };
  }

  if (q.includes("delivery") || q.includes("beta") || q.includes("time") || q.includes("result") || q.includes("40%")) {
    return {
      answer: `Beta testing across active sprints demonstrates a 40% reduction in project delivery time. This acceleration is driven by Nexus AI's automated task duration estimation (94% accuracy) and dynamic velocity-based sprint planning.`,
      citedTasks: ["NX-103", "NX-106"],
      actionRecommendation: "Export beta delivery acceleration report for executive stakeholders.",
    };
  }

  if (q.includes("pinecone") || q.includes("vector") || q.includes("search") || q.includes("embedding")) {
    const aiTasks = tasks.filter((t) => t.category === "AI / ML");
    return {
      answer: `Pinecone vector search is configured for hybrid dense/sparse semantic retrieval on Jira tickets. Active task NX-101 handles index initialization (1536 dimensions) with estimated delivery in 19.5 hours.`,
      citedTasks: aiTasks.map((t) => t.id),
    };
  }

  // Fallback semantic response
  return {
    answer: `Nexus AI analyzed your query against the project vector index (Pinecone) and GPT-4 context graph: The current sprint (Sprint 24) is on track with 38 of 45 allocated story points. Projected completion probability is 92.4% with zero unmitigated critical path blockers.`,
    citedTasks: tasks.slice(0, 2).map((t) => t.id),
    actionRecommendation: "Ask about team capacity, sprint risks, or task duration predictions anytime.",
  };
}
