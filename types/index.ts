// src/types/index.ts

export type TimeRange = "7d" | "30d";

export interface SummaryStat {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  trend?: string;
  trendLabel?: string;
}

export interface HeatmapCell {
  classId: string;
  className: string;
  date: string;
  lowMoodRate: number; // 0〜1
}

export interface ClassRow {
  classId: string;
  className: string;
  lastMood: string;
  avgSleepHours: number;
  lowMoodCount: number;
  urgentCount: number;
}

export interface DashboardData {
  summaryStats: SummaryStat[];
  heatmap: HeatmapCell[];
  classTable: ClassRow[];
  updatedAt: string;
}

// Firestore用の型定義
export interface StudentMoodEntry {
  userId: string;
  classId: string;
  timestamp: Date;
  moodLevel: 1 | 2 | 3 | 4 | 5; // 1=最悪, 5=最高
  sleepHours: number;
  isUrgent: boolean;
  message?: string;
}

export interface ClassMetrics {
  classId: string;
  className: string;
  grade: number;
  totalStudents: number;
  activeStudents: number;
  avgMoodLevel: number;
  avgSleepHours: number;
  lowMoodCount: number;
  urgentCount: number;
  lastUpdated: Date;
}
