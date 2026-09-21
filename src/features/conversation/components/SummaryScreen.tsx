import type { SessionSummary } from '../types';
import { Header } from './shared';

type SummaryScreenProps = {
  session: SessionSummary;
  onSave: () => void;
  onHome: () => void;
};

export function SummaryScreen({ session, onSave, onHome }: SummaryScreenProps) {
  return (
    <main className="screen center-screen summary-screen">
      <Header title="Buổi trò chuyện đã kết thúc!" subtitle="Cảm ơn An và ba mẹ đã cùng trò chuyện" />
      <div className="summary-hero">🌟</div>
      <section className="stats-grid">
        <div><strong>{session.turns}</strong><span>Lượt trao đổi</span></div>
        <div><strong>{session.responseSeconds}s</strong><span>Phản hồi</span></div>
        <div><strong>{session.aiSuggestions}</strong><span>Gợi ý</span></div>
        <div><strong>{session.cards.length}</strong><span>Thẻ đã chọn</span></div>
      </section>
      <section className="session-info">
        <div><span>Chủ đề</span><strong>{session.topic}</strong></div>
        <div><span>Thời gian</span><strong>{session.duration}</strong></div>
        <div><span>Thẻ đã chọn</span><strong>{session.cards.join(', ')}</strong></div>
      </section>
      <button className="primary-button" onClick={onSave}>Lưu lịch sử</button>
      <button className="text-button" onClick={onHome}>Về màn hình chính</button>
    </main>
  );
}
