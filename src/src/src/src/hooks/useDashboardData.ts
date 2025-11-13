import { useEffect, useState } from "react";

export type DailyPoint = {
  date: string; // YYYY-MM-DD
  records: number;
  lowCount: number;
};

export type ClassSummary = {
  classId: string;
  records: number;
  lowRate: number;
  bodyRate: number;
  avgSleep: number | null;
};

export type DashboardData = {
  loading: boolean;
  error?: string;
  daily: DailyPoint[];
  classes: ClassSummary[];
  totalCheckins: number;
  lowRateOverall: number;
  totalConsults: number;
};

function makeMock(days: number): DashboardData {
  const today = new Date();
  const daily: DailyPoint[] = [];
  let totalCheckins = 0;
  let totalLow = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const base = 20 + Math.round(Math.random() * 25); // 件数
    const lowRate = 0.15 + Math.random() * 0.2; // 15〜35%
    const lowCount = Math.round(base * lowRate);

    daily.push({
      date: dateStr,
      records: base,
      lowCount,
    });

    totalCheckins += base;
    totalLow += lowCount;
  }

  const classes: ClassSummary[] = [
    "2A",
    "2B",
    "3A",
    "1C",
    "1D",
    "3B",
  ].map((id, idx) => {
    const records = 80 + Math.round(Math.random() * 60);
    const lowRate =
      10 + Math.random() * (idx < 2 ? 25 : 15); // 上位のクラスほど高め
    const bodyRate = 5 + Math.random() * 20;
    const avgSleep = 5.5 + Math.random() * 2;
    return {
      classId: id,
      records,
      lowRate,
      bodyRate,
      avgSleep,
    };
  });

  const totalConsults = 15 + Math.round(Math.random() * 20);

  return {
    loading: false,
    daily,
    classes: classes.sort((a, b) => b.lowRate - a.lowRate),
    totalCheckins,
    lowRateOverall: (totalLow / totalCheckins) * 100,
    totalConsults,
  };
}

/**
 * 今は Firestore ではなくダミーデータを返す。
 * あとで安全な API を用意したら、ここを書き換えれば OK。
 */
export function useDashboardData(days: number = 30): DashboardData {
  const [data, setData] = useState<DashboardData>({
    loading: true,
    daily: [],
    classes: [],
    totalCheckins: 0,
    lowRateOverall: 0,
    totalConsults: 0,
  });

  useEffect(() => {
    setData((prev) => ({ ...prev, loading: true }));
    const timer = setTimeout(() => {
      setData(makeMock(days));
    }, 400); // 読み込みっぽく

    return () => clearTimeout(timer);
  }, [days]);

  return data;
}
