export type RoleType = "Frontend" | "Backend" | "AI / ML" | "DevOps" | "Product";

export interface TeamMember {
  id: string;
  name: string;
  role: RoleType;
  avatar: string;
  currentLoadHours: number;
  maxCapacityHours: number;
  avgVelocityPoints: number;
  skills: string[];
  status: "optimal" | "warning" | "overloaded";
}

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Backlog" | "Sprint Ready" | "In Progress" | "In Review" | "Done";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: RoleType;
  priority: PriorityLevel;
  status: TaskStatus;
  assigneeId?: string;
  storyPoints?: number;
  aiPredictedHours: number;
  confidenceScore: number; // 0 - 100
  historicalVariance: string; // e.g. "+/- 1.2 hrs"
  riskLevel: "Low" | "Moderate" | "High";
  riskFactors: string[];
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  capacityPoints: number;
  allocatedPoints: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Planning" | "Completed";
}

export interface PredictionResult {
  predictedHours: number;
  confidencePercentage: number;
  riskLevel: "Low" | "Moderate" | "High";
  storyPoints: number;
  breakdown: {
    baseEstimate: number;
    complexityMultiplier: number;
    historicalDeviation: number;
  };
  keyRiskFactors: string[];
  recommendedAssignee: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "nexus-ai";
  timestamp: string;
  text: string;
  citedTasks?: string[];
  actionRecommendation?: string;
}
