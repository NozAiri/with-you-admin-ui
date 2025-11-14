// src/components/common/LoadingSpinner.tsx
import React from "react";

export const LoadingSpinner: React.FC = () => {
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
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "400px" 
          }}>
            <div className="loading-spinner" />
          </div>
        </main>
      </div>
    </div>
  );
};
