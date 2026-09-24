import type { SyntheticEvent } from 'react';

import { pictogramPath } from '../logic/pictograms';
import { speak } from '../logic/speech';
import type { Message, Topic } from '../types';
import { Progress } from './shared';

type ConversationScreenProps = {
  topic: Topic;
  messages: readonly Message[];
  onFinish: () => void;
  onBack: () => void;
};

export function ConversationScreen({ topic, messages, onFinish, onBack }: ConversationScreenProps) {
  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1]?.text || '';

  return (
    <main className="screen conversation-screen spektrum-conversation-screen">
      <header className="spektrum-parent-topbar spektrum-conversation-topbar">
        <div className="spektrum-brand-group">
          <button className="spektrum-back-button" onClick={onBack} type="button" aria-label="Quay lại">
            ‹
          </button>
          <img className="spektrum-logo" src="/brand/spektrum-primary-logo.png" alt="Spektrum" />
        </div>

        <div className="parent-topic-badge spektrum-parent-topic-pill">
          <span className="spektrum-topic-icon">
            <img
              src={pictogramPath(topic.homePictogram)}
              alt=""
              aria-hidden="true"
              onError={(event: SyntheticEvent<HTMLImageElement>) => {
                event.currentTarget.hidden = true;
                const fallback = event.currentTarget.nextElementSibling;
                if (fallback instanceof HTMLElement) fallback.hidden = false;
              }}
            />
            <span hidden aria-hidden="true">{topic.icon}</span>
          </span>
          <span>
            <strong>Hội thoại</strong>
            <small>{topic.title}</small>
          </span>
        </div>
      </header>

      <section className="spektrum-conversation-body">
        <Progress step={3} />
        <section className="conversation-panel" aria-label="Nội dung cuộc trò chuyện">
          <div className="conversation-panel-title">
            <span aria-hidden="true">♡</span>
            <div>
              <small>Cuộc trò chuyện</small>
              <strong>{topic.title}</strong>
            </div>
          </div>

          <div className="chat-list spektrum-chat-list">
            {!hasMessages ? (
              <div className="chat-empty spektrum-chat-empty">
                <strong>Chưa có lượt trò chuyện nào</strong>
                <span>Mẹ có thể quay lại để chọn câu hỏi đầu tiên.</span>
              </div>
            ) : (
              messages.map((message, index) => (
                <article className={`chat-row ${message.role}`} key={`${message.role}-${index}`}>
                  <div className="chat-avatar">{message.role === 'parent' ? '👩' : '👦🏻'}</div>
                  <div className="chat-bubble">
                    <small>{message.role === 'parent' ? 'Mẹ' : 'Bảo An'}</small>
                    <span>{message.text}</span>
                    <em>{message.time}</em>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="composer-mock spektrum-conversation-status">
          <span>{hasMessages ? 'Cuộc trò chuyện đang diễn ra' : 'Chưa có nội dung để phát'}</span>
          <button onClick={() => speak(lastMessage)} type="button" aria-label="Đọc câu gần nhất">
            🔊
          </button>
        </section>
      </section>

      <footer className="spektrum-conversation-footer">
        <button className="primary-button spektrum-summary-button" onClick={onFinish}>
          Xem tổng kết buổi trò chuyện
        </button>
      </footer>
    </main>
  );
}
