// src/components/dashboard/ClassTable.tsx
import React from "react";

// 型定義をファイル内で定義
interface ClassRow {
  classId: string;
  className: string;
  lastMood: string;
  avgSleepHours: number;
  lowMoodCount: number;
  urgentCount: number;
}

interface ClassTableProps {
  data: ClassRow[];
}

export const ClassTable: React.FC<ClassTableProps> = ({ data }) => {
  return (
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
            {data.map((row) => (
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
  );
};
