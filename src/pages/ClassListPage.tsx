import React from 'react';
import { useFirestoreSimple } from '../hooks/useFirestoreSimple';

export default function ClassListPage() {
const groupId = '4c88b2eb878ccc49d303f1267707971c758426eadd304071117e34fc8143d197';  const data = useFirestoreSimple(groupId);

  if (data.loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <h2>📚 クラス一覧</h2>
        <p className="subtitle">各クラスの詳細情報を確認できます</p>
      </header>

      <section className="class-summary-section">
        <table className="class-table">
          <thead>
            <tr>
              <th>クラス</th>
              <th>最近のようす</th>
              <th>平均睡眠時間</th>
              <th>要フォロー</th>
            </tr>
          </thead>
          <tbody>
            {data.classSummary.map(cls => (
              <tr key={cls.classId}>
                <td className="class-name">{cls.classId}</td>
                <td className="mood-cell">
                  <span className="mood-emoji">{cls.recentMood}</span>
                  <span className="mood-label">{cls.moodLabel}</span>
                </td>
                <td>{cls.avgSleep.toFixed(1)} h</td>
                <td>
                  {cls.needsFollowCount > 0 ? (
                    <div className="follow-status">
                      {cls.needsFollowStudents.filter(s => s.level === 'level1').length > 0 && (
                        <span className="badge badge-urgent">
                          🔴 緊急{cls.needsFollowStudents.filter(s => s.level === 'level1').length}人
                        </span>
                      )}
                      {cls.needsFollowStudents.filter(s => s.level === 'level2').length > 0 && (
                        <span className="badge badge-warning">
                          🟡 注意{cls.needsFollowStudents.filter(s => s.level === 'level2').length}人
                        </span>
                      )}
                      {cls.needsFollowStudents.filter(s => s.level === 'level3').length > 0 && (
                        <span className="badge badge-info">
                          🔵 様子見{cls.needsFollowStudents.filter(s => s.level === 'level3').length}人
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="no-follow">特になし</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.classSummary.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
            まだデータがありません
          </p>
        )}
      </section>
    </div>
  );
}
