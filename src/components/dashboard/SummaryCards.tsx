// src/components/dashboard/SummaryCards.tsx
import React from "react";
import { SummaryStat } from "../../types";

interface SummaryCardsProps {
  stats: SummaryStat[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <section className="section">
      <div className="card-grid">
        {stats.map((s) => (
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
  );
};
