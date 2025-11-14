/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

6. コミット：`fix: Vite型定義追加`

---

## 🔧 修正2：SummaryCards.tsx がまだ古いimportを持っている

エラーメッセージ：
```
src/components/dashboard/SummaryCards.tsx(3,29): error TS2307: Cannot find module '../../types'
