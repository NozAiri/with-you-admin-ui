import React, { useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const sidebarItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "heatmap", icon: "🧊", label: "Heatmap" },
  { id: "interventions", icon: "🪄", label: "Interventions" },
  { id: "alerts", icon: "🔔", label: "Alerts" },
  { id: "messages", icon: "📨", label: "Messages" },
];

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function App() {
  const [days, setDays] = useState(30);
  const [activeSidebar, setActiveSidebar] = useState("dashboard");
  const {
    loading,
    error,
    daily,
    classes,
    totalCheckins,
    lowRateOverall,
    totalConsults,
  } = useDashboardData(days);

  const last = daily[daily.length - 1];
  const todayLowRate =
    last && last.records > 0
      ? (last.lowCount / last.records) * 100
      : undefined;

  return (
    <div className="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">WY</div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={
                "sidebar-icon-btn" +
                (activeSidebar === item.id ? " sidebar-icon-btn--active" : "")
              }
              onClick={() => setActiveSidebar(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom-icon">⚙️</div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="main-header">
          <div>
            <div className="header-eyebrow">With You · School Admin</div>
            <h1 className="header-title">Class Wellbeing Overview</h1>
          </div>
          <div className="header-right">
            <select
              className="header-select"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
            </select>
            <div className="header-avatar">A</div>
          </div>
        </header>

        {/* KPI row */}
        <section className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-label">Mood check-ins</div>
            <div className="kpi-value">
              {loading ? "…" : totalCheckins}
              <span className="kpi-unit"> entries</span>
            </div>
            <div className="kpi-caption">
              All classes · last {days} days
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Low mood rate</div>
            <div className="kpi-value">
              {loading ? "…" : lowRateOverall.toFixed(1)}
              <span className="kpi-unit"> %</span>
            </div>
            <div className="kpi-caption">😟 share of all mood reports</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Consultations</div>
            <div className="kpi-value">{loading ? "…" : totalConsults}</div>
            <div className="kpi-caption">Anonymous messages (mock)</div>
          </div>
        </section>

        {/* Big chart */}
        <section className="panel panel--bigchart">
          <div className="panel-header">
            <div>
              <div className="panel-title">Daily low mood trend</div>
              <div className="panel-subtitle">
                Each point = percentage of 😟 mood reports per day
              </div>
            </div>
          </div>

          <div className="bigchart-wrapper">
            <div className="bigchart-main">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={daily.map((d) => ({
                    date: d.date,
                    label: formatDateLabel(d.date),
                    lowRate:
                      d.records === 0 ? 0 : (d.lowCount / d.records) * 100,
                    records: d.records,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6fd8" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4a46ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.03)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#8da2ff", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "#8da2ff", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      borderRadius: 12,
                      border: "1px solid rgba(148,171,255,0.6)",
                    }}
                    labelFormatter={(value, payload) =>
                      payload && payload[0]
                        ? payload[0].payload.date
                        : String(value)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="lowRate"
                    stroke="#ff6fd8"
                    fill="url(#colorLow)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* floating card */}
            <div className="floating-card">
              <div className="floating-label">Today’s snapshot</div>
              <div className="floating-main">
                {todayLowRate === undefined ? (
                  <span className="floating-value">—</span>
                ) : (
                  <>
                    <span className="floating-value">
                      {todayLowRate.toFixed(1)}
                    </span>
                    <span className="floating-unit">%</span>
                  </>
                )}
              </div>
              <div className="floating-caption">
                Share of students reporting low mood today
              </div>
            </div>
          </div>
        </section>

        {/* Class ranking */}
        <section className="panel">
          <div className="panel-header panel-header--table">
            <div>
              <div className="panel-title">Class heatmap · ranking</div>
              <div className="panel-subtitle">
                Classes at the top may need a quick check-in this week.
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="class-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class</th>
                  <th>Low mood</th>
                  <th>Physical</th>
                  <th>Avg sleep</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  classes.map((c, idx) => (
                    <tr
                      key={c.classId}
                      className={
                        idx < 3 ? "class-row class-row--highlight" : "class-row"
                      }
                    >
                      <td>{idx + 1}</td>
                      <td>
                        <div className="class-cell">
                          <div className="class-avatar">
                            {c.classId.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="class-name">{c.classId}</div>
                            <div className="class-sub">
                              {idx < 3 ? "Watch closely" : "Stable"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.lowRate.toFixed(1)}
                        <span className="table-unit">%</span>
                      </td>
                      <td>
                        {c.bodyRate.toFixed(1)}
                        <span className="table-unit">%</span>
                      </td>
                      <td>
                        {c.avgSleep == null ? "—" : c.avgSleep.toFixed(1)}
                        <span className="table-unit">
                          {c.avgSleep == null ? "" : "h"}
                        </span>
                      </td>
                      <td>{c.records}</td>
                    </tr>
                  ))}
                {!loading && !error && classes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No data (mock generator returned empty set)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
