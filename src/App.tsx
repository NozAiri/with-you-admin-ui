// src/App.tsx
import React from "react";
import { useDashboardData } from "./hooks/useDashboardData";

import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { Heatmap } from "./components/dashboard/Heatmap";
import { ClassTable } from "./components/dashboard/ClassTable";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const App: React.FC = () => {
  const { data, timeRange, setTimeRange, isLoading } = useDashboardData();

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app-root">
      <div className="app-layout">
        <Sidebar />

        <main className="main">
          <Header
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            updatedAt={data.updatedAt}
          />

          <SummaryCards stats={data.summaryStats} />

          <div className="section section-grid">
            <Heatmap data={data.heatmap} />
            <ClassTable data={data.classTable} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
