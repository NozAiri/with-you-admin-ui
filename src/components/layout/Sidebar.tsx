// src/components/layout/Sidebar.tsx
import React from "react";

export const Sidebar: React.FC = () => {
  return (
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
  );
};
