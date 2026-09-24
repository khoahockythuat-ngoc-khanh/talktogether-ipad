import type { SyntheticEvent } from 'react';

import { PARENT_QUESTION_LIMIT } from '../data/constants';
import { pictogramPath } from '../logic/pictograms';
import type { Topic } from '../types';
import { Progress, TurnActionButtons } from './shared';

type ParentQuestionScreenProps = {
  topic: Topic;
  questionIndex: number | null;
  onPickQuestion: (index: number) => void;
  onDone: () => void;
  onEndConversation: () => void;
  onBack: () => void;
};

export function ParentQuestionScreen({ topic, questionIndex, onPickQuestion, onDone, onEndConversation, onBack }: ParentQuestionScreenProps) {
  const visibleQuestions = topic.questions.slice(0, PARENT_QUESTION_LIMIT);

  return (
    <main className="screen parent-board-screen spektrum-parent-screen">
      <header className="spektrum-parent-topbar">
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
            <strong>{topic.title}</strong>
            <small>{PARENT_QUESTION_LIMIT} câu hỏi</small>
          </span>
        </div>
      </header>

      <section className="parent-board-body spektrum-parent-body">
        <Progress step={1} />
        <section className="parent-question-panel">
          <div className="parent-question-panel-copy">
            <small>Chủ đề {topic.title.toLowerCase()}</small>
            <strong>Mẹ muốn hỏi gì?</strong>
          </div>
          <span aria-hidden="true">♡</span>
        </section>
        <section className="parent-question-grid" aria-label="Danh sách câu hỏi cho mẹ">
          {visibleQuestions.map((question, index) => (
            <button
              key={question}
              className={`parent-question-card ${questionIndex === index ? 'selected' : ''}`}
              onClick={() => onPickQuestion(index)}
            >
              <span className="parent-question-number">{index + 1}</span>
              <strong>{question}</strong>
              <span className="parent-question-check">{questionIndex === index ? '✓' : ''}</span>
            </button>
          ))}
        </section>
      </section>

      <footer className="parent-board-bottom spektrum-parent-bottom">
        <TurnActionButtons
          doneDisabled={questionIndex == null}
          onDone={onDone}
          onEnd={onEndConversation}
        />
      </footer>
    </main>
  );
}
