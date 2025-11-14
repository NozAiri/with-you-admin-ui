import React from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';import { db } from '../../lib/firebase';
interface ConsultMessage {
  id: string;
  ts: Timestamp;
  message: string;
  topics: string[];
  intent: string;
  risk_level: string;
  class_info?: {
    class_id: string;
  };
}

export default function ConsultRequestPage() {
  const [messages, setMessages] = React.useState<ConsultMessage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchConsults = async () => {
      try {
        const consultRef = collection(db, 'consult_msgs');
const consultQuery = query(consultRef, where('group_id', '==', '4c88b2eb878ccc49d303f1267707971c758426eadd304071117e34fc8143d197'));
        const snapshot = await getDocs(consultQuery);
        
        const data: ConsultMessage[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() } as ConsultMessage);
        });
        
        // 日時順にソート（新しい順）
        data.sort((a, b) => b.ts.toDate().getTime() - a.ts.toDate().getTime());
        
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error('相談データ取得エラー:', error);
        setLoading(false);
      }
    };

    fetchConsults();
  }, []);

  if (loading) {
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
        <h2>💬 相談リクエスト</h2>
        <p className="subtitle">生徒からの相談メッセージ一覧（匿名）</p>
      </header>

      <section className="class-summary-section">
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
            まだ相談メッセージがありません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className="item"
                style={{
                  background: msg.risk_level === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : '#1e293b',
                  borderLeft: msg.risk_level === 'urgent' ? '4px solid #ef4444' : 
                              msg.risk_level === 'medium' ? '4px solid #f59e0b' : '4px solid #3b82f6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {msg.class_info?.class_id || '不明'}
                    </span>
                    <span style={{ marginLeft: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                      {msg.ts.toDate().toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div>
                    {msg.risk_level === 'urgent' && (
                      <span className="badge badge-urgent">🔴 緊急</span>
                    )}
                    {msg.risk_level === 'medium' && (
                      <span className="badge badge-warning">🟡 注意</span>
                    )}
                  </div>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#cbd5e1' }}>相談内容：</strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                    {msg.message}
                  </p>
                </div>
                
                {msg.topics && msg.topics.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {msg.topics.map((topic, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#93c5fd',
                          borderRadius: '9999px',
                          fontSize: '0.8rem'
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
