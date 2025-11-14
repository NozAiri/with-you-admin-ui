import React from 'react';
import { useFirestoreSimple } from './hooks/useFirestoreSimple';
import './App.css';

function App() {
  // ダミーのgroup_id（実際は認証から取得）
  const groupId = 'test-group-id';
  const data = useFirestoreSimple(groupId);

  if (data.loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>データを読み込み中...</p>
      </div>
    );
  }

  // 要フォロー総数
  const totalNeedsFollow = data.needsFollowUp.level1 + data.needsFollowUp.level2 + data.needsFollowUp.level3;

  return (
    <div className="app-container">
      {/* サイドバー */}
      <aside className="sidebar">
        <div className="logo">
          <h1>With You.</h1>
        </div>
        <nav className="nav-menu">
          <a href="#dashboard" className="nav-item active">
            📊 ダッシュボード
          </a>
          <a href="#classes" className="nav-item">
            📚 クラス一覧
          </a>
          <a href="#consults" className="nav-item">
            💬 相談リクエスト
          </a>
          <a href="#settings" className="nav-item">
            ⚙️ 設定
          </a>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="main-content">
        <header className="page-header">
          <h2>Heatmap（クラス/学年の傾向・匿名）</h2>
          <p className="subtitle">
            「今日を伝える」「相談する」から送られたデータをもとに、クラスごとの傾向をざっくり把握するための画面です。
          </p>
        </header>

        {/* サマリーカード */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-header">利用生徒数</div>
            <div className="card-value">{data.totalStudents}</div>
            <div className="card-note">アカウント登録済み</div>
          </div>

          <div className="card card-warning">
            <div className="card-header">要フォロー生徒</div>
            <div className="card-value">{totalNeedsFollow}</div>
            <div className="card-breakdown">
              <div className="level-item level-1">
                <span className="level-badge">🔴 緊急</span>
                <span className="level-count">{data.needsFollowUp.level1}人</span>
              </div>
              <div className="level-item level-2">
                <span className="level-badge">🟡 注意</span>
                <span className="level-count">{data.needsFollowUp.level2}人</span>
              </div>
              <div className="level-item level-3">
                <span className="level-badge">🔵 様子見</span>
                <span className="level-count">{data.needsFollowUp.level3}人</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">相談リクエスト</div>
            <div className="card-value">{data.consultRequests}</div>
          </div>

          <div className="card">
            <div className="card-header">平均睡眠時間</div>
            <div className="card-value">{data.averageSleepHours.toFixed(1)} h</div>
          </div>
        </div>

        {/* 低気分率ヒートマップ */}
        <section className="heatmap-section">
          <h3>低気分率ヒートマップ</h3>
          <p className="section-description">
            濃いほどしんどいと答えた生徒の割合が高いクラスです。
          </p>
          <div className="heatmap">
            {data.lowMoodRateByClass.map(cls => (
              <div key={cls.classId} className="heatmap-row">
                <div className="heatmap-label">{cls.classId}</div>
                <div className="heatmap-bar-container">
                  <div
                    className="heatmap-bar"
                    style={{
                      width: `${cls.lowMoodRate}%`,
                      backgroundColor: getHeatmapColor(cls.lowMoodRate),
                    }}
                  ></div>
                  <span className="heatmap-value">{cls.lowMoodRate.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* クラス別サマリー */}
        <section className="class-summary-section">
          <h3>クラス別サマリー</h3>
          <p className="section-description">
            「要フォロー生徒数」や「睡眠時間」など、クラスごとのざっくり傾向です。個人名は表示されません。
          </p>
          <table className="class-table">
            <thead>
              <tr>
                <th>クラス</th>
                <th>最近のようす</th>
                <th>平均睡眠時間</th>
                <th>しんどい生徒</th>
                <th>要フォロー</th>
              </tr>
            </thead>
            <tbody>
              {data.classSummary.map(cls => (
                <tr key={cls.classId}>
                  <td className="class-name">{cls.classId}</td>
                  <td className="mood-cell">
                    <span className="mood-emoji">{cls.recentMood}</span>
                    <span className="mood-label">{cls.moodLabel}</span>
                  </td>
                  <td>{cls.avgSleep.toFixed(1)} h</td>
                  <td>{cls.needsFollowStudents.filter(s => s.level === 'level1' || s.level === 'level2').length}人</td>
                  <td>
                    {cls.needsFollowCount > 0 ? (
                      <div className="follow-status">
                        {cls.needsFollowStudents.filter(s => s.level === 'level1').length > 0 && (
                          <span className="badge badge-urgent">🔴 緊急{cls.needsFollowStudents.filter(s => s.level === 'level1').length}人</span>
                        )}
                        {cls.needsFollowStudents.filter(s => s.level === 'level2').length > 0 && (
                          <span className="badge badge-warning">🟡 注意{cls.needsFollowStudents.filter(s => s.level === 'level2').length}人</span>
                        )}
                        {cls.needsFollowStudents.filter(s => s.level === 'level3').length > 0 && (
                          <span className="badge badge-info">🔵 様子見{cls.needsFollowStudents.filter(s => s.level === 'level3').length}人</span>
                        )}
                      </div>
                    ) : (
                      <span className="no-follow">特になし</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* エビデンス表示 */}
        <section className="evidence-section">
          <details>
            <summary>📚 スクリーニング基準について（臨床的根拠）</summary>
            <div className="evidence-content">
              <h4>🔴 レベル1: 緊急対応が必要</h4>
              <ul>
                <li>リスクレベルが「緊急」</li>
                <li>相談メッセージに危険ワード（"死にたい", "消えたい"など）</li>
                <li>気分😟 かつ 睡眠4時間未満（重度睡眠障害）</li>
                <li>身体症状3つ以上 + 気分😟（抑うつリスク11.3倍）*</li>
                <li>身体症状4つ全て（抑うつリスク16.4倍）*</li>
              </ul>

              <h4>🟡 レベル2: 注意が必要（週次確認推奨）</h4>
              <ul>
                <li>3日連続で気分😟</li>
                <li>1週間で気分😟が5日以上</li>
                <li>3日連続で睡眠5時間未満</li>
                <li>身体症状2つ（抑うつリスク7.1倍）*</li>
                <li>過眠 + 抑うつ（回避行動の可能性）**</li>
                <li>相談リクエスト未対応で3日経過</li>
              </ul>

              <h4>🔵 レベル3: 様子見（月次モニタリング）</h4>
              <ul>
                <li>気分😟が単発</li>
                <li>睡眠5-6時間（やや短い）</li>
                <li>身体症状1つ（抑うつリスク2.7倍）*</li>
              </ul>

              <p className="evidence-note">
                * 国立成育医療研究センター研究（2025）: 頭痛・腹痛・背部痛・めまいの身体症状数と抑うつリスクの相関<br />
                ** 行動活性化療法の視点: 過眠は不快な感情からの回避行動の可能性
              </p>
            </div>
          </details>
        </section>
      </main>
    </div>
  );
}

// ヒートマップの色を計算
function getHeatmapColor(rate: number): string {
  if (rate >= 75) return '#dc2626'; // 赤
  if (rate >= 50) return '#f97316'; // オレンジ
  if (rate >= 25) return '#fbbf24'; // 黄色
  return '#10b981'; // 緑
}

export default App;
