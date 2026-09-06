export type Branch = "happy" | "unhappy";

export interface Feedback {
  id: string;
  rating: number; // 1-5
  branch: Branch;
  /** Happy branch: up to 2 reasons the guest picked */
  satisfactionReasons?: string[];
  /** Unhappy branch: the single top-level issue category */
  issue?: string;
  /** Unhappy branch: the root cause chosen under that issue */
  rootCause?: string;
  /** Free-text used only for the "Khác" (Other) paths */
  comment?: string;
  timestamp: string; // ISO string
  location?: string;
  isDemo?: boolean;
}

export interface DashboardAlert {
  issueLabel: string;
  count: number;
  windowLabel: string;
  recommendation: string;
}
