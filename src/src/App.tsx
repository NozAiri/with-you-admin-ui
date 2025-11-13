// src/App.tsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDashboardData } from "./hooks/useDashboardData";

const App: React.FC = () => {
  const { todayLabel, summaries, moodTrend, classStats } = useDashboardData();

  return (
    <div className="dashboard-container">
      {/* ヘッダー */}
      <header className="header">
        <div>
          <div className="header-title">With You – School Admin</div>
          <div className="header-date">今日のサマリー：{todayLabel}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 14 }}>
          <div>テスト中ダッシュボード</div>
          <div style={{ opacity: 0.7 }}>（実運用の前に値をすり合わせ）</div>
        </div>
      </header>

      {/* 上部のサマリーカード */}
      <section className="card">
        <div className="section-title">Today overview</div>
        <div className="stat-grid">
          {summaries.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 13, opacity: 0.8 }}>{s.label}</div>
              <div className="stat-value">
                {s.value}
                {s.unit && <span style={{ fontSize: 18 }}> {s.unit}</span>}
              </div>
              <div className="stat-label">{s.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* mood の推移チャート */}
      <section className="card">
        <div className="section-title">Low mood trend（直近5日）</div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodTrend} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6ec7" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#ff6ec7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="#c7c7c7" />
              <YAxis stroke="#c7c7c7" />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 17, 25, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="lowMoodRate"
                stroke="#ff6ec7"
                fillOpacity={1}
                fill="url(#colorLow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* クラスごとの一覧＋バーグラフ */}
      <section className="card">
        <div className="section-title">Heatmap / Class reports</div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 24 }}>
          {/* テーブル */}
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>クラス</th>
                  <th>直近の気分</th>
                  <th>1日あたり回答数</th>
                  <th>今週の相談</th>
                  <th>平均睡眠</th>
                  <th>リスク</th>
                </tr>
              </thead>
              <tbody>
                {classStats.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.lastMood}</td>
                    <td>{c.dailyAvg}</td>
                    <td>{c.consultThisWeek}</td>
                    <td>{c.sleepAvg.toFixed(1)} h</td>
                    <td
                      className={
                        c.riskLevel === "high"
                          ? "heat-high"
                          : c.riskLevel === "mid"
                          ? "heat-mid"
                          : "heat-low"
                      }
                    >
                      {c.riskLevel === "high"
                        ? "高め"
                        : c.riskLevel === "mid"
                        ? "やや注意"
                        : "落ち着き"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* バーグラフ（クラス別相談件数） */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classStats} margin={{ top: 10, right: 10, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#c7c7c7" />
                <YAxis stroke="#c7c7c7" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 17, 25, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="consultThisWeek" fill="#4ea3f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
