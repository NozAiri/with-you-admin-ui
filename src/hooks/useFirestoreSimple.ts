// src/hooks/useFirestoreSimple.ts（修正版）
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import type { DashboardData, TimeRange } from "../types";

// Firebase初期化
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 気分の絵文字を数値に変換
const moodEmojiToScore = (mood: string): number => {
  if (mood === "😟") return 2; // つらい
  if (mood === "😐") return 1; // ふつう
  if (mood === "🙂") return 0; // まあまあ
  return 1; // デフォルト
};

// 気分を絵文字に変換（表示用）
const moodScoreToEmoji = (avgScore: number): string => {
  if (avgScore >= 1.5) return "😟 とてもしんどい";
  if (avgScore >= 0.8) return "😐 少ししんどい";
  return "🙂 ふつう";
};

export const useFirestoreSimple = (timeRange: TimeRange) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 期間の計算
        const now = new Date();
        const daysAgo = timeRange === "7d" ? 7 : 30;
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // 前週比較用（7日前〜14日前）
        const prevStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // =====================
        // 1. school_share コレクション（気分・睡眠データ）
        // =====================
        const shareRef = collection(db, "school_share");
        const shareQuery = query(
          shareRef,
          where("ts", ">=", Timestamp.fromDate(startDate)),
          orderBy("ts", "desc"),
          limit(500)
        );
        const shareSnapshot = await getDocs(shareQuery);
        const shareData = shareSnapshot.docs.map((doc) => doc.data());

        // 前週データ（先週比計算用）
        const prevShareQuery = query(
          shareRef,
          where("ts", ">=", Timestamp.fromDate(prevStartDate)),
          where("ts", "<", Timestamp.fromDate(startDate)),
          orderBy("ts", "desc"),
          limit(500)
        );
        const prevShareSnapshot = await getDocs(prevShareQuery);
        const prevShareData = prevShareSnapshot.docs.map((doc) => doc.data());

        // =====================
        // 2. consult_msgs コレクション（相談データ）
        // =====================
        const consultRef = collection(db, "consult_msgs");
        const consultQuery = query(
          consultRef,
          where("ts", ">=", Timestamp.fromDate(startDate)),
          orderBy("ts", "desc"),
          limit(500)
        );
        const consultSnapshot = await getDocs(consultQuery);
        const consultData = consultSnapshot.docs.map((doc) => doc.data());

        // =====================
        // 3. サマリーカード用の集計
        // =====================

        // 3-1. 利用生徒数（ユニークな user_key）
        const uniqueUsers = new Set(shareData.map((d) => d.user_key).filter(Boolean));
        const totalStudents = uniqueUsers.size;

        // 3-2. 要フォロー生徒（risk_level === "urgent"）
        const urgentUsers = new Set(
          shareData
            .filter((d) => d.risk_level === "urgent")
            .map((d) => d.user_key)
            .filter(Boolean)
        );
        const urgentCount = urgentUsers.size;

        // 前週の要フォロー生徒数
        const prevUrgentUsers = new Set(
          prevShareData
            .filter((d) => d.risk_level === "urgent")
            .map((d) => d.user_key)
            .filter(Boolean)
        );
        const urgentTrend = urgentCount - prevUrgentUsers.size;

        // 3-3. 相談リクエスト
        const consultCount = consultData.length;
        const consultUrgent = consultData.filter((d) => d.risk_level === "urgent").length;

        // 3-4. 平均睡眠時間
        const sleepValues = shareData
          .map((d) => d.payload?.sleep_hours)
          .filter((h): h is number => typeof h === "number" && h > 0);
        const avgSleep = sleepValues.length > 0 ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : 0;

        const prevSleepValues = prevShareData
          .map((d) => d.payload?.sleep_hours)
          .filter((h): h is number => typeof h === "number" && h > 0);
        const prevAvgSleep =
          prevSleepValues.length > 0 ? prevSleepValues.reduce((a, b) => a + b, 0) / prevSleepValues.length : 0;
        const sleepTrend = prevAvgSleep > 0 ? avgSleep - prevAvgSleep : 0;

        // =====================
        // 4. クラス別集計（Heatmap & ClassTable用）
        // =====================
        const classSummary: Record<
          string,
          {
            className: string;
            totalRecords: number;
            lowMoodCount: number;
            moodScoreSum: number;
            sleepSum: number;
            sleepCount: number;
            urgentCount: number;
          }
        > = {};

        shareData.forEach((d) => {
          const classId = d.class_info?.class_id || "不明";
          if (!classSummary[classId]) {
            classSummary[classId] = {
              className: classId,
              totalRecords: 0,
              lowMoodCount: 0,
              moodScoreSum: 0,
              sleepSum: 0,
              sleepCount: 0,
              urgentCount: 0,
            };
          }

          const mood = d.payload?.mood || "😐";
          const moodScore = moodEmojiToScore(mood);
          const sleepHours = d.payload?.sleep_hours;

          classSummary[classId].totalRecords++;
          classSummary[classId].moodScoreSum += moodScore;

          if (mood === "😟") {
            classSummary[classId].lowMoodCount++;
          }

          if (typeof sleepHours === "number" && sleepHours > 0) {
            classSummary[classId].sleepSum += sleepHours;
            classSummary[classId].sleepCount++;
          }

          if (d.risk_level === "urgent") {
            classSummary[classId].urgentCount++;
          }
        });

        // =====================
        // 5. Heatmap データ生成
        // =====================
        const heatmap = Object.entries(classSummary).map(([classId, stats]) => ({
          classId,
          className: stats.className,
          date: new Date().toISOString().split("T")[0],
          lowMoodRate: stats.totalRecords > 0 ? stats.lowMoodCount / stats.totalRecords : 0,
        }));

        // 低気分率で降順ソート
        heatmap.sort((a, b) => b.lowMoodRate - a.lowMoodRate);

        // =====================
        // 6. ClassTable データ生成
        // =====================
        const classTable = Object.entries(classSummary).map(([classId, stats]) => {
          const avgMoodScore = stats.totalRecords > 0 ? stats.moodScoreSum / stats.totalRecords : 0;
          const avgSleepHours = stats.sleepCount > 0 ? stats.sleepSum / stats.sleepCount : 0;

          return {
            classId,
            className: stats.className,
            lastMood: moodScoreToEmoji(avgMoodScore),
            avgSleepHours,
            lowMoodCount: stats.lowMoodCount,
            urgentCount: stats.urgentCount,
          };
        });

        // クラス名でソート（学年・組順）
        classTable.sort((a, b) => a.className.localeCompare(b.className, "ja"));

        // =====================
        // 7. 最終データ構築
        // =====================
        const dashboardData: DashboardData = {
          updatedAt: `直近${daysAgo}日 / ${new Date().toLocaleString("ja-JP", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })} 時点`,
          summaryStats: [
            {
              id: "students",
              label: "利用生徒数",
              value: String(totalStudents),
              subLabel: "アカウント登録済み",
            },
            {
              id: "follow",
              label: "要フォロー生徒",
              value: String(urgentCount),
              trend: urgentTrend !== 0 ? (urgentTrend > 0 ? `+${urgentTrend}` : String(urgentTrend)) : undefined,
              trendLabel: urgentTrend !== 0 ? "先週比" : undefined,
            },
            {
              id: "consult",
              label: "相談リクエスト",
              value: String(consultCount),
              subLabel: consultUrgent > 0 ? `うち緊急 ${consultUrgent} 件` : undefined,
            },
            {
              id: "sleep",
              label: "平均睡眠時間",
              value: `${avgSleep.toFixed(1)} h`,
              trend: sleepTrend !== 0 ? `${sleepTrend > 0 ? "+" : ""}${sleepTrend.toFixed(1)}h` : undefined,
              trendLabel: sleepTrend !== 0 ? "前週比" : undefined,
            },
          ],
          heatmap,
          classTable,
        };

        setData(dashboardData);
      } catch (error) {
        console.error("Firestore取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, isLoading };
};
