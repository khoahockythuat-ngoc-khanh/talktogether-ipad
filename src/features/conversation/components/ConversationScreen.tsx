import { speak } from '../logic/speech';
import type { Message, Topic } from '../types';
import { Header, Progress } from './shared';

type ConversationScreenProps = {
  topic: Topic;
  messages: readonly Message[];
  onFinish: () => void;
  onBack: () => void;
};

export function ConversationScreen({ topic, messages, onFinish, onBack }: ConversationScreenProps) {
  return (
    <main className="screen conversation-screen">
      <Header title="Cuộc trò chuyện" subtitle={topic.title} onBack={onBack} />
      <Progress step={3} />
      <section className="chat-list">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <strong>Chưa có lượt trò chuyện nào</strong>
            <span>Mẹ có thể quay lại để chọn câu hỏi đầu tiên.</span>
          </div>
        ) : (
          messages.map((message, index) => (
            <div className={`chat-row ${message.role}`} key={`${message.role}-${index}`}>
              <div className="chat-avatar">{message.role === 'parent' ? '👩' : '🧒'}</div>
              <div className="chat-bubble">
                <small>{message.role === 'parent' ? 'Mẹ' : 'An'}</small>
                <span>{message.text}</span>
                <em>{message.time}</em>
              </div>
            </div>
          ))
        )}
      </section>
      <section className="composer-mock">
        <span>{messages.length === 0 ? 'Chưa có nội dung để phát' : 'Cuộc trò chuyện đang diễn ra...'}</span>
        <button onClick={() => speak(messages[messages.length - 1]?.text || '')}>🔊</button>
      </section>
      <button className="primary-button" onClick={onFinish}>Xem tổng kết buổi trò chuyện</button>
    </main>
  );
}
