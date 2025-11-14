// src/hooks/useDashboardData.ts
import { useEffect, useState } from "react";

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

// 時間範囲ごとのモックデータ
const MOCK_DATA: Record<TimeRange, DashboardData> = {
  "30d": {
    updatedAt: "直近30日 / 11月14日 08:30 時点",
    summaryStats: [
      {
        id: "students",
        label: "利用生徒数",
        value: "214",
        subLabel: "アカウント登録済み",
      },
      {
        id: "risk",
        label: "要フォロー生徒",
        value: "7",
        trend: "+2",
        trendLabel: "先週比",
      },
      {
        id: "consult",
        label: "相談リクエスト",
        value: "18",
        subLabel: "うち緊急 3 件",
      },
      {
        id: "sleep",
        label: "平均睡眠時間",
        value: "6.1 h",
        trend: "-0.3h",
        trendLabel: "前月比",
      },
    ],
    heatmap: [
      {
        classId: "1A",
        className: "1年A組",
        date: "2025-11-10",
        lowMoodRate: 0.22,
      },
      {
        classId: "1B",
        className: "1年B組",
        date: "2025-11-10",
        lowMoodRate: 0.08,
      },
      {
        classId: "2A",
        className: "2年A組",
        date: "2025-11-10",
        lowMoodRate: 0.31,
      },
      {
        classId: "3A",
        className: "3年A組",
        date: "2025-11-10",
        lowMoodRate: 0.17,
      },
    ],
    classTable: [
      {
        classId: "1A",
        className: "1年A組",
        lastMood: "😟 少ししんどい",
        avgSleepHours: 5.8,
        lowMoodCount: 6,
        urgentCount: 2,
      },
      {
        classId: "1B",
        className: "1年B組",
        lastMood: "🙂 ふつう",
        avgSleepHours: 6.4,
        lowMoodCount: 2,
        urgentCount: 0,
      },
      {
        classId: "2A",
        className: "2年A組",
        lastMood: "😢 とてもしんどい",
        avgSleepHours: 5.3,
        lowMoodCount: 8,
        urgentCount: 3,
      },
      {
        classId: "3A",
        className: "3年A組",
        lastMood: "🙂 ふつう",
        avgSleepHours: 6.7,
        lowMoodCount: 3,
        urgentCount: 0,
      },
    ],
  },
  "7d": {
    updatedAt: "直近7日 / 11月14日 08:30 時点",
    summaryStats: [
      {
        id: "students",
        label: "利用生徒数",
        value: "184",
        subLabel: "直近7日で利用",
      },
      {
        id: "risk",
        label: "要フォロー生徒",
        value: "5",
        trend: "+1",
        trendLabel: "前週比",
      },
      {
        id: "consult",
        label: "相談リクエスト",
        value: "9",
        subLabel: "うち緊急 1 件",
      },
      {
        id: "sleep",
        label: "平均睡眠時間",
        value: "6.3 h",
        trend: "-0.1h",
        trendLabel: "前週比",
      },
    ],
    heatmap: [
      {
        classId: "1A",
        className: "1年A組",
        date: "2025-11-10",
        lowMoodRate: 0.18,
      },
      {
        classId: "1B",
        className: "1年B組",
        date: "2025-11-10",
        lowMoodRate: 0.06,
      },
      {
        classId: "2A",
        className: "2年A組",
        date: "2025-11-10",
        lowMoodRate: 0.27,
      },
      {
        classId: "3A",
        className: "3年A組",
        date: "2025-11-10",
        lowMoodRate: 0.14,
      },
    ],
    classTable: [
      {
        classId: "1A",
        className: "1年A組",
        lastMood: "😟 少ししんどい",
        avgSleepHours: 5.9,
        lowMoodCount: 4,
        urgentCount: 1,
      },
      {
        classId: "1B",
        className: "1年B組",
        lastMood: "🙂 ふつう",
        avgSleepHours: 6.5,
        lowMoodCount: 1,
        urgentCount: 0,
      },
      {
        classId: "2A",
        className: "2年A組",
        lastMood: "😢 とてもしんどい",
        avgSleepHours: 5.2,
        lowMoodCount: 6,
        urgentCount: 2,
      },
      {
        classId: "3A",
        className: "3年A組",
        lastMood: "🙂 ふつう",
        avgSleepHours: 6.8,
        lowMoodCount: 2,
        urgentCount: 0,
      },
    ],
  },
};

export const useDashboardData = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // 本番ではここで Firestore / API から取得する想定
    setData(MOCK_DATA[timeRange]);
  }, [timeRange]);

  return {
    data,
    timeRange,
    setTimeRange,
    isLoading: !data,
  };
};
