import React from 'react';

export default function SettingsPage() {
  return (
    <div>
      <header className="page-header">
        <h2>⚙️ 設定</h2>
        <p className="subtitle">システム情報と設定</p>
      </header>

      <section className="class-summary-section">
        <h3 style={{ marginBottom: '1rem', color: '#f1f5f9' }}>システム情報</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="item">
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              バージョン
            </div>
            <div style={{ color: '#94a3b8' }}>
              v2.0 - 臨床的根拠に基づくスクリーニングシステム
            </div>
          </div>

          <div className="item">
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              スクリーニング基準
            </div>
            <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              <p>🔴 <strong>レベル1（緊急）</strong>：即日中の個別面談推奨</p>
              <p>🟡 <strong>レベル2（注意）</strong>：週1回の経過観察推奨</p>
              <p>🔵 <strong>レベル3（様子見）</strong>：月1回の全体モニタリング</p>
            </div>
          </div>

          <div className="item">
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              エビデンス
            </div>
            <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>国立成育医療研究センター研究（2025）：身体症状数と抑うつリスク相関</li>
                <li>行動活性化療法：回避行動・過眠パターンの検出</li>
                <li>思春期うつ病研究：持続的な低気分・睡眠障害の重要性</li>
              </ul>
            </div>
          </div>

          <div className="item">
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              データソース
            </div>
            <div style={{ color: '#94a3b8' }}>
              生徒側アプリ「With You.」から送信された匿名データ
            </div>
          </div>

          <div className="item">
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              免責事項
            </div>
            <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              このシステムは<strong>スクリーニングツール</strong>であり、診断ツールではありません。
              判定結果は参考情報として使用してください。
              最終的な支援判断は専門家が行ってください。
            </div>
          </div>

          <div className="item" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: '0.5rem' }}>
              緊急連絡先
            </div>
            <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
              <p>児童相談所虐待対応ダイヤル：<strong>189</strong></p>
              <p>よりそいホットライン：<strong>0120-279-338</strong></p>
              <p>いのちの電話：<strong>0570-783-556</strong></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
