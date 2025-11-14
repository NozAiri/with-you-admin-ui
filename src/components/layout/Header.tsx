// src/components/layout/Header.tsx
import React from "react";
import { TimeRange } from "../../types";

interface HeaderProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  updatedAt: string;
}

export const Header: React.FC<HeaderProps> = ({
  timeRange,
  setTimeRange,
  updatedAt,
}) => {
  return (
    <header className="main-header">
      <div>
        <h1>Heatmap(クラス/学年の傾向・匿名)</h1>
        <p className="muted">
          「今日を伝える」「相談する」から送られたデータをもとに、
          クラスごとの傾向をざっくり把握するための画面です。
        </p>
      </div>
      <div className="header-right">
        <div className="time-range-toggle">
          <button
            className={timeRange === "7d" ? "pill pill-active" : "pill"}
            onClick={() => setTimeRange("7d")}
          >
            直近7日
          </button>
          <button
            className={timeRange === "30d" ? "pill pill-active" : "pill"}
            onClick={() => setTimeRange("30d")}
          >
            直近30日
          </button>
        </div>
        <div className="updated-at">{updatedAt}</div>
      </div>
    </header>
  );
};
