'use client';

import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { CARD_CATEGORY_ORDER, CATEGORY_LABELS, QUICK_RESPONSES } from '../data/constants';
import { getCardPageCount, getCardsForQuestion } from '../logic/cards';
import { pictogramPath } from '../logic/pictograms';
import type { Card, Topic } from '../types';
import { Header, Progress, TurnActionButtons } from './shared';

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

  useEffect(() => {
    setCardPage(0);
  }, [question, topic.id, hasAiCards]);

  function showMoreCards(): void {
    if (!hasMoreCards) return;
    setCardPage((current) => (current + 1) % cardPageCount);
  }

  return (
    <main className="screen child-screen">
      <Header title="Lượt của An" subtitle="Chọn thẻ để trả lời" onBack={onBack} />
      <Progress step={2} />
      <section className="prompt-card child-prompt-card">
        <span>👩‍👦</span>
        <div>
          <small>Mẹ hỏi</small>
          <strong>“{question}”</strong>
        </div>
        <button
          className="more-cards-button"
          onClick={showMoreCards}
          type="button"
          disabled={!hasMoreCards}
          aria-label="Thêm thẻ trả lời"
        >
          <span aria-hidden="true">↻</span>
          <strong>Thêm thẻ</strong>
          <small>{cardPage + 1}/{cardPageCount}</small>
        </button>
      </section>
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
      <section className="quick-row">
        {QUICK_RESPONSES.map(([icon, label]) => {
          const quickCard: Card = [icon, label, 'quick'];
          return (
            <button key={label} onClick={() => onQuick(quickCard)}>
              <span className="quick-icon">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </section>
      <section className={`sentence-bar ${sentence ? 'ready' : ''}`}>
        <div className="sentence-bar-top">
          <small>Câu của An</small>
          {sentence ? (
            <button className="reset-response-button" onClick={onReset} type="button">
              <span aria-hidden="true">↺</span>
              <span>Chọn lại</span>
            </button>
          ) : null}
        </div>
        <strong>{sentence || 'Chạm vào các thẻ để tạo câu trả lời'}</strong>
      </section>
      <TurnActionButtons
        doneDisabled={!sentence}
        onDone={() => onSpeak(sentence)}
        onEnd={() => onEndConversation(sentence)}
      />
    </main>
  );
}
