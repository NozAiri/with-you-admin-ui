import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// ===========================
// 型定義
// ===========================

interface ClassInfo {
  grade: string;
  class_name: string;
  class_id: string;
}

interface MoodPayload {
  mood: string; // "😟" | "😐" | "🙂"
  mood_label: string; // "つらい" | "ふつう" | "まあまあ"
  body: string[]; // ["頭痛", "腹痛", ...]
  sleep_hours: number;
  sleep_quality: string; // "ぐっすり" | "ふつう" | "浅い"
  memo?: string;
}

interface MoodDoc {
  ts: Timestamp;
  group_id: string;
  handle: string;
  user_key: string;
  class_info: ClassInfo;
  payload: MoodPayload;
  risk_level: 'urgent' | 'medium' | 'low';
  anonymous: boolean;
}

interface ConsultDoc {
  ts: Timestamp;
  group_id: string;
  class_info: ClassInfo;
  message: string;
  topics: string[];
  intent: 'counselor' | 'teacher';
  risk_level: 'urgent' | 'medium' | 'low';
  anonymous: boolean;
  user_key?: string;
}

// ===========================
// スクリーニングレベル定義
// ===========================

type ScreeningLevel = 'level1' | 'level2' | 'level3' | 'none';

interface ScreeningResult {
  level: ScreeningLevel;
  reasons: string[]; // スクリーニングに引っかかった理由
}

// ===========================
// 臨床的根拠に基づく危険ワードリスト
// ===========================

const DANGER_WORDS = [
  '死にたい',
  '消えたい',
  '辛すぎる',
  '助けて',
  '生きる意味',
  'もうだめ',
  '死',
  '自殺',
  '終わりたい',
  'つらすぎ'
];

// 国立成育医療研究センター研究で特定された身体症状
const KEY_SYMPTOMS = ['頭痛', '腹痛', '背部痛', 'めまい'];

// ===========================
// ユーティリティ関数
// ===========================

/**
 * 相談メッセージに危険ワードが含まれるかチェック
 */
function hasDangerWords(message: string): boolean {
  return DANGER_WORDS.some(word => message.includes(word));
}

/**
 * 身体症状の数をカウント（国立成育医療研究センター基準）
 */
function countKeySymptoms(symptoms: string[]): number {
  return symptoms.filter(s => KEY_SYMPTOMS.includes(s)).length;
}

/**
 * N日連続で気分😟が続いているかチェック
 */
function hasConsecutiveBadMood(history: MoodDoc[], days: number): boolean {
  if (history.length < days) return false;
  
  // 最新からN日分をチェック
  const recent = history.slice(0, days);
  return recent.every(doc => doc.payload.mood === '😟');
}

/**
 * 指定期間内で気分😟の日数をカウント
 */
function countBadMoodDays(history: MoodDoc[], withinDays: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - withinDays);
  
  return history.filter(doc => {
    const docDate = doc.ts.toDate();
    return docDate >= cutoffDate && doc.payload.mood === '😟';
  }).length;
}

/**
 * N日連続で睡眠5時間未満が続いているかチェック
 */
function hasConsecutiveLowSleep(history: MoodDoc[], days: number, threshold: number = 5): boolean {
  if (history.length < days) return false;
  
  const recent = history.slice(0, days);
  return recent.every(doc => doc.payload.sleep_hours < threshold);
}

/**
 * 過眠（10時間以上）の頻度をチェック
 */
function hasFrequentOversleep(history: MoodDoc[], withinDays: number): boolean {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - withinDays);
  
  const oversleepCount = history.filter(doc => {
    const docDate = doc.ts.toDate();
    return docDate >= cutoffDate && doc.payload.sleep_hours >= 10;
  }).length;
  
  return oversleepCount >= 3; // 直近で3回以上過眠
}

// ===========================
// メインスクリーニングロジック
// ===========================

/**
 * 臨床的根拠に基づく多段階スクリーニング
 * 
 * 【エビデンス】
 * - 国立成育医療研究センター: 身体症状数と抑うつリスク相関
 * - 行動活性化療法: 回避行動・過眠パターンの検出
 * - 思春期うつ病研究: 持続的な低気分・睡眠障害の重要性
 */
function screenStudent(
  latestDoc: MoodDoc,
  history: MoodDoc[],
  consultHistory: ConsultDoc[]
): ScreeningResult {
  const reasons: string[] = [];
  
  // ===========================
  // レベル1: 緊急対応が必要
  // ===========================
  
  // 自殺リスク・重度抑うつ
  if (latestDoc.risk_level === 'urgent') {
    reasons.push('リスクレベル: 緊急');
  }
  
  const latestConsult = consultHistory[0];
  if (latestConsult && hasDangerWords(latestConsult.message)) {
    reasons.push('相談メッセージに危険ワード検出');
  }
  
  // 重度の気分低下 + 睡眠障害
  if (latestDoc.payload.mood === '😟' && latestDoc.payload.sleep_hours < 4) {
    reasons.push('重度抑うつ + 重度睡眠障害（4時間未満）');
  }
  
  // 身体症状スクリーニング（国立成育医療研究センター基準）
  const symptomCount = countKeySymptoms(latestDoc.payload.body);
  
  if (symptomCount >= 3 && latestDoc.payload.mood === '😟') {
    reasons.push(`身体症状3つ以上 + 抑うつ（リスク11.3倍）`);
  }
  
  if (symptomCount === 4) {
    reasons.push('身体症状4つ全て（リスク16.4倍）');
  }
  
  if (reasons.length > 0) {
    return { level: 'level1', reasons };
  }
  
  // ===========================
  // レベル2: 注意が必要
  // ===========================
  
  // 持続的な抑うつパターン
  if (hasConsecutiveBadMood(history, 3)) {
    reasons.push('3日連続で気分😟');
  }
  
  const badMoodWeek = countBadMoodDays(history, 7);
  if (badMoodWeek >= 5) {
    reasons.push(`1週間で気分😟が${badMoodWeek}日`);
  }
  
  // 睡眠障害パターン
  if (hasConsecutiveLowSleep(history, 3, 5)) {
    reasons.push('3日連続で睡眠5時間未満');
  }
  
  if (latestDoc.payload.sleep_hours >= 4 && latestDoc.payload.sleep_hours < 5 && latestDoc.payload.mood === '😐') {
    reasons.push('睡眠4-5時間 + 軽度抑うつ');
  }
  
  // 身体症状中等度
  if (symptomCount === 2) {
    reasons.push('身体症状2つ（リスク7.1倍）');
  }
  
  if (symptomCount === 1 && latestDoc.payload.mood === '😟') {
    reasons.push('身体症状1つ + 抑うつ（リスク複合）');
  }
  
  // 行動活性化の視点: 回避行動の兆候
  if (latestDoc.payload.sleep_hours >= 10 && latestDoc.payload.mood === '😟') {
    reasons.push('過眠 + 抑うつ（回避行動の可能性）');
  }
  
  if (hasFrequentOversleep(history, 7)) {
    reasons.push('頻繁な過眠（週3回以上10時間超）');
  }
  
  // 相談リクエスト未対応
  if (latestConsult) {
    const daysSinceConsult = Math.floor(
      (Date.now() - latestConsult.ts.toDate().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceConsult >= 3) {
      reasons.push(`相談リクエスト未対応（${daysSinceConsult}日経過）`);
    }
  }
  
  if (reasons.length > 0) {
    return { level: 'level2', reasons };
  }
  
  // ===========================
  // レベル3: 様子見
  // ===========================
  
  // 軽度リスク
  if (latestDoc.payload.mood === '😟') {
    reasons.push('気分😟（単発）');
  }
  
  if (latestDoc.payload.sleep_hours >= 5 && latestDoc.payload.sleep_hours < 6) {
    reasons.push('睡眠5-6時間（やや短い）');
  }
  
  if (symptomCount === 1) {
    reasons.push('身体症状1つ（リスク2.7倍）');
  }
  
  // 生活習慣の乱れ
  if (latestDoc.payload.sleep_hours >= 8 && latestDoc.payload.mood === '😐') {
    reasons.push('睡眠十分だが気分😐（睡眠の質？）');
  }
  
  if (reasons.length > 0) {
    return { level: 'level3', reasons };
  }
  
  return { level: 'none', reasons: [] };
}

// ===========================
// React Hook: useFirestoreSimple
// ===========================

interface FirestoreData {
  loading: boolean;
  totalStudents: number;
  needsFollowUp: {
    level1: number;
    level2: number;
    level3: number;
  };
  consultRequests: number;
  averageSleepHours: number;
  classSummary: {
    classId: string;
    recentMood: string;
    moodLabel: string;
    avgSleep: number;
    needsFollowCount: number;
    needsFollowStudents: Array<{
      userKey: string;
      level: ScreeningLevel;
      reasons: string[];
    }>;
  }[];
  lowMoodRateByClass: {
    classId: string;
    lowMoodRate: number;
  }[];
}

export function useFirestoreSimple(groupId: string) {
  const [data, setData] = useState<FirestoreData>({
    loading: true,
    totalStudents: 0,
    needsFollowUp: { level1: 0, level2: 0, level3: 0 },
    consultRequests: 0,
    averageSleepHours: 0,
    classSummary: [],
    lowMoodRateByClass: [],
  });

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        // ===========================
        // 1. 気分・睡眠データ取得（全履歴）
        // ===========================
        const moodRef = collection(db, 'school_share');
        // group_id が空の場合はフィルタしない
const moodQuery = groupId 
  ? query(moodRef, where('group_id', '==', groupId))
  : query(moodRef);
        const moodSnapshot = await getDocs(moodQuery);

        const allMoodDocs: MoodDoc[] = [];
        moodSnapshot.forEach(doc => {
          allMoodDocs.push(doc.data() as MoodDoc);
        });

        // 日時順にソート（新しい順）
        allMoodDocs.sort((a, b) => b.ts.toDate().getTime() - a.ts.toDate().getTime());

        // ===========================
        // 2. 相談メッセージ取得（全履歴）
        // ===========================
        const consultRef = collection(db, 'consult_msgs');
const consultQuery = groupId
  ? query(consultRef, where('group_id', '==', groupId))
  : query(consultRef);        const consultSnapshot = await getDocs(consultQuery);

        const allConsultDocs: ConsultDoc[] = [];
        consultSnapshot.forEach(doc => {
          allConsultDocs.push(doc.data() as ConsultDoc);
        });

        allConsultDocs.sort((a, b) => b.ts.toDate().getTime() - a.ts.toDate().getTime());

        // ===========================
        // 3. ユーザーごとにデータを整理
        // ===========================
        const userHistoryMap = new Map<string, MoodDoc[]>();
        const userConsultMap = new Map<string, ConsultDoc[]>();
        const uniqueUsers = new Set<string>();

        allMoodDocs.forEach(doc => {
          uniqueUsers.add(doc.user_key);
          
          if (!userHistoryMap.has(doc.user_key)) {
            userHistoryMap.set(doc.user_key, []);
          }
          userHistoryMap.get(doc.user_key)!.push(doc);
        });

        allConsultDocs.forEach(doc => {
          if (doc.user_key) {
            if (!userConsultMap.has(doc.user_key)) {
              userConsultMap.set(doc.user_key, []);
            }
            userConsultMap.get(doc.user_key)!.push(doc);
          }
        });

        // ===========================
        // 4. スクリーニング実行
        // ===========================
        let level1Count = 0;
        let level2Count = 0;
        let level3Count = 0;
        const classMap = new Map<string, any>();

        userHistoryMap.forEach((history, userKey) => {
          const latestDoc = history[0];
          const consultHistory = userConsultMap.get(userKey) || [];
          
          // スクリーニング
          const screening = screenStudent(latestDoc, history, consultHistory);
          
          // カウント
          if (screening.level === 'level1') level1Count++;
          else if (screening.level === 'level2') level2Count++;
          else if (screening.level === 'level3') level3Count++;
          
          // クラス別集計
          const classId = latestDoc.class_info.class_id;
          if (!classMap.has(classId)) {
            classMap.set(classId, {
              classId,
              moodDocs: [],
              needsFollowStudents: [],
            });
          }
          
          classMap.get(classId).moodDocs.push(latestDoc);
          
          if (screening.level !== 'none') {
            classMap.get(classId).needsFollowStudents.push({
              userKey,
              level: screening.level,
              reasons: screening.reasons,
            });
          }
        });

        // ===========================
        // 5. 集計データ作成
        // ===========================
        const totalSleepHours = allMoodDocs.reduce((sum, doc) => sum + doc.payload.sleep_hours, 0);
        const avgSleep = allMoodDocs.length > 0 ? totalSleepHours / allMoodDocs.length : 0;

        const classSummary = Array.from(classMap.values()).map(cls => {
          const classAvgSleep = cls.moodDocs.reduce((sum: number, d: MoodDoc) => sum + d.payload.sleep_hours, 0) / cls.moodDocs.length;
          const latestMood = cls.moodDocs[0];
          
          return {
            classId: cls.classId,
            recentMood: latestMood.payload.mood,
            moodLabel: latestMood.payload.mood_label,
            avgSleep: classAvgSleep,
            needsFollowCount: cls.needsFollowStudents.length,
            needsFollowStudents: cls.needsFollowStudents,
          };
        });

        // 低気分率計算
        const lowMoodRateByClass = Array.from(classMap.values()).map(cls => {
          const totalInClass = cls.moodDocs.length;
          const lowMoodCount = cls.moodDocs.filter((d: MoodDoc) => d.payload.mood === '😟').length;
          const rate = totalInClass > 0 ? (lowMoodCount / totalInClass) * 100 : 0;
          
          return {
            classId: cls.classId,
            lowMoodRate: rate,
          };
        });

        setData({
          loading: false,
          totalStudents: uniqueUsers.size,
          needsFollowUp: {
            level1: level1Count,
            level2: level2Count,
            level3: level3Count,
          },
          consultRequests: allConsultDocs.length,
          averageSleepHours: avgSleep,
          classSummary,
          lowMoodRateByClass,
        });
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [groupId]);

  return data;
}
