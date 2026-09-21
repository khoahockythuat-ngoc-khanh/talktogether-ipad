import type { SyntheticEvent } from 'react';

import { PARENT_QUESTION_LIMIT } from '../data/constants';
import { TOPICS } from '../data/topics';
import { pictogramPath } from '../logic/pictograms';
import type { HistoryItem, Topic } from '../types';
import { Header } from './shared';

type HomeScreenProps = {
  onSelect: (topic: Topic) => void;
  onHistory: () => void;
  histories: readonly HistoryItem[];
};

export function HomeScreen({ onSelect, onHistory, histories }: HomeScreenProps) {
  return (
    <main className="screen home-screen">
      <Header
        title="Xin chào An 👋"
        subtitle="Hôm nay An muốn trò chuyện về gì?"
        right={
          <button className="history-pill" onClick={onHistory}>
            🕘 {histories.length}
          </button>
        }
      />
      <div className="topic-section-head">
        <h2>Chọn chủ đề</h2>
        <span>{PARENT_QUESTION_LIMIT} câu hỏi mỗi chủ đề</span>
      </div>
      <section className="topic-list">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            className="topic-card"
            data-topic={topic.id}
            onClick={() => onSelect(topic)}
            aria-label={`${topic.title}: ${topic.subtitle}`}
          >
            <span className="topic-card-main">
              <span className="topic-icon">
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
                <span className="topic-emoji-fallback" hidden aria-hidden="true">{topic.icon}</span>
              </span>
              <span className="topic-copy">
                <strong>{topic.title}</strong>
                <small>{topic.subtitle}</small>
              </span>
              <span className="topic-count">{PARENT_QUESTION_LIMIT}</span>
            </span>
            <span className="topic-tags">
              {topic.homeTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
            <span className="chevron">›</span>
          </button>
        ))}
      </section>
      <p className="credit-note">Pictograms: ARASAAC / Sergio Palao</p>
    </main>
  );
}
