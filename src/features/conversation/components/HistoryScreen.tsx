import type { HistoryItem } from '../types';
import { Header } from './shared';

type HistoryScreenProps = {
  histories: readonly HistoryItem[];
  onBack: () => void;
  onClear: () => void;
};

export function HistoryScreen({ histories, onBack, onClear }: HistoryScreenProps) {
  return (
    <main className="screen">
      <Header title="Lịch sử trò chuyện" subtitle="Theo dõi các phiên đã lưu trên thiết bị" onBack={onBack} />
      {histories.length === 0 ? (
        <section className="empty-state">
          <div>🗂️</div>
          <h2>Chưa có phiên nào</h2>
          <p>Sau khi hoàn thành một cuộc trò chuyện, phiên đó sẽ xuất hiện ở đây.</p>
        </section>
      ) : (
        <section className="history-list">
          {histories.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-icon">{item.icon}</div>
              <div>
                <strong>{item.topic}</strong>
                <small>{item.date} · {item.time}</small>
                <span>{item.turns} lượt · {item.cards.length} thẻ AAC</span>
              </div>
              <div className="history-arrow">›</div>
            </article>
          ))}
        </section>
      )}
      {histories.length > 0 ? <button className="danger-soft-button" onClick={onClear}>Xóa lịch sử demo</button> : null}
    </main>
  );
}
