// src/hooks/useDashboardData.ts

export type SummaryCard = {
  label: string;
  value: string;
  unit?: string;
  description: string;
  trend?: "up" | "down" | "flat";
};

export type DailyPoint = {
  date: string;
  lowMoodRate: number;
  submissions: number;
};

export type ClassStat = {
  id: string;
  name: string;
  lastMood: string;
  dailyAvg: string;
  consultThisWeek: number;
  sleepAvg: number;
  riskLevel: "low" | "mid" | "high";
};

export function useDashboardData() {
  // ここは今はダミーデータ。あとで Firestore に差し替えできるようにしてある
  const todayLabel = "2025-11-11（Tue）";

  const summaries: SummaryCard[] = [
    {
      label: "低気分の割合",
      value: "18.4",
      unit: "%",
      description: "今週の全体のうち「しんどい」に近い回答の割合",
      trend: "up",
    },
    {
      label: "相談送信率",
      value: "72",
      unit: "%",
      description: "「しんどい」と答えた生徒のうち、実際に相談を送った割合",
      trend: "up",
    },
    {
      label: "平均睡眠時間",
      value: "6.3",
      unit: "h",
      description: "直近1週間の平均睡眠時間",
      trend: "down",
    },
  ];

  const moodTrend: DailyPoint[] = [
    { date: "Mon", lowMoodRate: 12, submissions: 90 },
    { date: "Tue", lowMoodRate: 15, submissions: 110 },
    { date: "Wed", lowMoodRate: 18, submissions: 130 },
    { date: "Thu", lowMoodRate: 22, submissions: 140 },
    { date: "Fri", lowMoodRate: 25, submissions: 160 },
  ];

  const classStats: ClassStat[] = [
    {
      id: "1A",
      name: "1年A組",
      lastMood: "🙂",
      dailyAvg: "4.2 /日",
      consultThisWeek: 2,
      sleepAvg: 6.8,
      riskLevel: "low",
    },
    {
      id: "1B",
      name: "1年B組",
      lastMood: "😟",
      dailyAvg: "5.4 /日",
      consultThisWeek: 5,
      sleepAvg: 5.9,
      riskLevel: "mid",
    },
    {
      id: "2A",
      name: "2年A組",
      lastMood: "😢",
      dailyAvg: "6.1 /日",
      consultThisWeek: 7,
      sleepAvg: 5.3,
      riskLevel: "high",
    },
  ];

  return { todayLabel, summaries, moodTrend, classStats };
}
