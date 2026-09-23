'use client';

import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { CARD_CATEGORY_ORDER, CATEGORY_LABELS, QUICK_RESPONSES } from '../data/constants';
import { getCardPageCount, getCardsForQuestion } from '../logic/cards';
import { pictogramPath } from '../logic/pictograms';
import type { Card, Topic } from '../types';
import { Progress, TurnActionButtons } from './shared';

type ChildAACScreenProps = {
  topic: Topic;
  question: string;
  selected: readonly Card[];
  aiCards?: readonly Card[] | null;
  onToggle: (card: Card) => void;
  onQuick: (card: Card) => void;
  onReset: () => void;
  onSpeak: (sentence: string) => void;
  onEndConversation: (sentence?: string) => void;
  onBack: () => void;
};

export function ChildAACScreen({ topic, question, selected, aiCards, onToggle, onQuick, onReset, onSpeak, onEndConversation, onBack }: ChildAACScreenProps) {
  const [cardPage, setCardPage] = useState(0);
  const fallbackPageCount = getCardPageCount(topic, question);
  const hasAiCards = Boolean(aiCards?.length);
  const cardPageCount = hasAiCards ? fallbackPageCount + 1 : fallbackPageCount;
  const cardsForQuestion = hasAiCards && cardPage === 0
    ? [...(aiCards || [])]
    : getCardsForQuestion(topic, question, hasAiCards ? cardPage - 1 : cardPage);
  const cardColumns = CARD_CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    cards: cardsForQuestion.filter((card) => card[2] === category).slice(0, 4),
  }));
  const sentence = selected.map((card) => card[1]).join(' · ');
  const hasMoreCards = cardPageCount > 1;
  const selectedTokens = selected.length ? selected : [];

  useEffect(() => {
    setCardPage(0);
  }, [question, topic.id, hasAiCards]);

  function showMoreCards(): void {
    if (!hasMoreCards) return;
    setCardPage((current) => (current + 1) % cardPageCount);
  }

  return (
    <main className="screen child-screen aac-board-screen">
      <section className="board-sentence-strip" aria-label="Câu trả lời của An">
        <button className="board-back-button" onClick={onBack} type="button" aria-label="Quay lại">
          ‹
        </button>
        <div className="sentence-tokens">
          {selectedTokens.length ? (
            selectedTokens.map((card) => (
              <button
                className={`sentence-token ${card[2]}`}
                key={card[1]}
                onClick={() => onToggle(card)}
                type="button"
                aria-label={`Bỏ thẻ ${card[1]}`}
              >
                <span className="sentence-token-icon">
                  <img
                    src={pictogramPath(card[1])}
                    alt=""
                    aria-hidden="true"
                    onError={(event: SyntheticEvent<HTMLImageElement>) => {
                      event.currentTarget.hidden = true;
                      const fallback = event.currentTarget.nextElementSibling;
                      if (fallback instanceof HTMLElement) fallback.hidden = false;
                    }}
                  />
                  <span hidden aria-hidden="true">{card[0]}</span>
                </span>
                <strong>{card[1]}</strong>
              </button>
            ))
          ) : (
            <div className="sentence-placeholder">
              <small>Câu của An</small>
              <strong>Chạm vào thẻ để tạo câu trả lời</strong>
            </div>
          )}
        </div>
        <div className="board-toolset compact">
          <button
            className="board-tool clear"
            disabled={!sentence}
            onClick={onReset}
            type="button"
            aria-label="Chọn lại"
          >
            ⌫
          </button>
        </div>
      </section>

      <section className="board-workspace">
        <aside className="board-rail" aria-label="Nhóm thẻ">
          <button className="rail-button active" onClick={onBack} type="button" aria-label="Quay lại chọn câu hỏi">
            ⌂
          </button>
          <button
            className="rail-refresh"
            onClick={showMoreCards}
            type="button"
            disabled={!hasMoreCards}
            aria-label="Thêm thẻ trả lời"
          >
            ↻
          </button>
        </aside>
        <div className="board-content">
          <section className="board-question-card">
            <span>👩‍👦</span>
            <div>
              <small>Mẹ hỏi</small>
              <strong>“{question}”</strong>
            </div>
            <em>{cardPage + 1}/{cardPageCount}</em>
          </section>
          <Progress step={2} />
          <section className="aac-columns" aria-label="Thẻ trả lời của An">
            {cardColumns.map(({ category, label, cards }) => (
              <div className="aac-column" key={category}>
                <h2 className={`aac-column-title ${category}`}>{label}</h2>
                <div className="aac-column-cards">
                  {cards.map((card) => {
                    const active = selected.some((item) => item[1] === card[1]);
                    return (
                      <button
                        key={card[1]}
                        className={`aac-card ${card[2]} ${active ? 'active' : ''}`}
                        onClick={() => onToggle(card)}
                        aria-label={`${label}: ${card[1]}`}
                      >
                        <span className="aac-symbol">
                          <img
                            className="aac-pictogram"
                            src={pictogramPath(card[1])}
                            alt=""
                            aria-hidden="true"
                            onError={(event: SyntheticEvent<HTMLImageElement>) => {
                              event.currentTarget.hidden = true;
                              const fallback = event.currentTarget.nextElementSibling;
                              if (fallback instanceof HTMLElement) fallback.hidden = false;
                            }}
                          />
                          <span className="aac-emoji-fallback" hidden aria-hidden="true">{card[0]}</span>
                        </span>
                        <strong>{card[1]}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>

      <section className="board-bottom-bar">
        <div className="quick-row" aria-label="Trả lời nhanh">
          {QUICK_RESPONSES.map(([icon, label]) => {
            const quickCard: Card = [icon, label, 'quick'];
            return (
              <button
                key={label}
                onClick={() => onQuick(quickCard)}
                type="button"
                aria-label={`Trả lời nhanh: ${label}`}
              >
                <span className="quick-icon">{icon}</span>
                <strong>{label}</strong>
              </button>
            );
          })}
        </div>
        <div className="board-footer-actions">
          <button
            className="board-more-button"
            onClick={showMoreCards}
            type="button"
            disabled={!hasMoreCards}
            aria-label="Thêm thẻ trả lời"
          >
            <span>↻</span>
            <strong>Thêm thẻ</strong>
          </button>
          <TurnActionButtons
            doneDisabled={!sentence}
            onDone={() => onSpeak(sentence)}
            onEnd={() => onEndConversation(sentence)}
          />
        </div>
      </section>
    </main>
  );
}
