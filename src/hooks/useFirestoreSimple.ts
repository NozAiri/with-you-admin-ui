// src/hooks/useFirestoreSimple.ts
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, Timestamp, orderBy, limit } from "firebase/firestore";
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

        // school_share コレクションから取得
        const shareRef = collection(db, "school_share");
        const shareQuery = query(
          shareRef,
          where("ts", ">=", Timestamp.fromDate(startDate)),
          orderBy("ts", "desc"),
          limit(100)
        );

        const shareSnapshot = await getDocs(shareQuery);
        const shareData = shareSnapshot.docs.map(doc => doc.data());

        // 簡易集計
        const totalRecords = shareData.length;
        const lowMoodCount = shareData.filter(d => d.payload?.mood === "😟").length;
        const lowMoodRate = totalRecords > 0 ? lowMoodCount / totalRecords : 0;

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
              value: String(totalRecords),
              subLabel: "データ件数",
            },
            {
              id: "low_mood",
              label: "低気分の割合",
              value: `${(lowMoodRate * 100).toFixed(1)}%`,
            },
          ],
          heatmap: [
            {
              classId: "all",
              className: "全体",
              date: new Date().toISOString().split("T")[0],
              lowMoodRate: lowMoodRate,
            },
          ],
          classTable: [
            {
              classId: "all",
              className: "全体",
              lastMood: lowMoodRate > 0.3 ? "😟" : "🙂",
              avgSleepHours: 6.0,
              lowMoodCount: lowMoodCount,
              urgentCount: 0,
            },
          ],
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
