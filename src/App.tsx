// src/App.tsx
import React from "react";
import { useDashboardData } from "./hooks/useDashboardData";

const App: React.FC = () => {
  const { data, timeRange, setTimeRange, isLoading } = useDashboardData();

  if (isLoading || !data) {
    return (
      <div className="app-root">
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-logo">With You</div>
          </aside>
          <main className="main">
            <div className="main-header">
              <h1>ダッシュボード</h1>
              <p className="muted">データを読み込み中です...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-layout">
        {/* サイドバー */}
        <aside className="sidebar">
          <div className="sidebar-logo">With You</div>
          <nav className="sidebar-nav">
            <button className="nav-item nav-item-active">
              <span className="nav-dot" />
              ダッシュボード
            </button>
            <button className="nav-item">クラス一覧</button>
            <button className="nav-item">相談リクエスト</button>
            <button className="nav-item">設定</button>
          </nav>
          <div className="sidebar-footer">
            <p className="sidebar-caption">
              データはすべて
              <br />
              匿名で集計されています。
            </p>
          </div>
        </aside>

        {/* メイン */}
        <main className="main">
          {/* ヘッダー */}
          <header className="main-header">
            <div>
              <h1>Heatmap（クラス/学年の傾向・匿名）</h1>
              <p className="muted">
                「今日を伝える」「相談する」から送られたデータをもとに、
                クラスごとの傾向をざっくり把握するための画面です。
              </p>
            </div>
            <div className="header-right">
              <div className="time-range-toggle">
                <button
                  className={
                    timeRange === "7d" ? "pill pill-active" : "pill"
                  }
                  onClick={() => setTimeRange("7d")}
                >
                  直近7日
                </button>
                <button
                  className={
                    timeRange === "30d" ? "pill pill-active" : "pill"
                  }
                  onClick={() => setTimeRange("30d")}
                >
                  直近30日
                </button>
              </div>
              <div className="updated-at">{data.updatedAt}</div>
            </div>
          </header>

          {/* サマリーカード */}
          <section className="section">
            <div className="card-grid">
              {data.summaryStats.map((s) => (
                <article key={s.id} className="card">
                  <div className="card-label">{s.label}</div>
                  <div className="card-value">{s.value}</div>
                  <div className="card-sub">
                    {s.subLabel && <span>{s.subLabel}</span>}
                    {s.trend && (
                      <span className="card-trend">
                        {s.trendLabel} {s.trend}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="section section-grid">
            {/* ヒートマップテーブル（簡易版） */}
            <section className="panel">
              <div className="panel-header">
                <h2>低気分率ヒートマップ</h2>
                <p className="muted small">
                  濃いほど「しんどい」と答えた生徒の割合が高いクラスです。
                </p>
              </div>
              <div className="heat-table">
                <div className="heat-header-row">
                  <div className="heat-cell head">クラス</div>
                  <div className="heat-cell head">低気分の割合</div>
                </div>
                {data.heatmap.map((c) => (
                  <div key={c.classId} className="heat-row">
                    <div className="heat-cell">{c.className}</div>
                    <div className="heat-cell">
                      <div className="heatbar-wrapper">
                        <div
                          className="heatbar"
                          style={{ width: `${c.lowMoodRate * 100}%` }}
                        />
                        <span className="heatbar-label">
                          {(c.lowMoodRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* クラス別テーブル */}
            <section className="panel">
              <div className="panel-header">
                <h2>クラス別サマリー</h2>
                <p className="muted small">
                  「要フォロー生徒数」や「睡眠時間」など、クラスごとのざっくり傾向です。
                  個人名は表示されません。
                </p>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
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
                    {data.classTable.map((row) => (
                      <tr key={row.classId}>
                        <td>{row.className}</td>
                        <td>{row.lastMood}</td>
                        <td>{row.avgSleepHours.toFixed(1)} h</td>
                        <td>{row.lowMoodCount} 人</td>
                        <td>
                          {row.urgentCount > 0 ? (
                            <span className="badge badge-danger">
                              要フォロー {row.urgentCount} 人
                            </span>
                          ) : (
                            <span className="badge badge-safe">特になし</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
