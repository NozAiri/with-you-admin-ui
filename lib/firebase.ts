// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 環境変数から取得（Vercelの環境変数設定で追加する）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase初期化エラーチェック
if (!firebaseConfig.projectId) {
  console.error("❌ Firebase環境変数が設定されていません。");
  console.error("設定を確認してください:", firebaseConfig);
}

// Firebase初期化
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("✅ Firebase初期化成功:", firebaseConfig.projectId);
} catch (error) {
  console.error("❌ Firebase初期化エラー:", error);
}

export { app, db, auth };
