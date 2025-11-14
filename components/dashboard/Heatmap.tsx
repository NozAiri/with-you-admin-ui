// src/components/dashboard/Heatmap.tsx
import React from "react";
import { HeatmapCell } from "../../types";

interface HeatmapProps {
  data: HeatmapCell[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  return (
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
        {data.map((c) => (
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
  );
};
