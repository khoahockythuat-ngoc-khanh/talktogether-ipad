import { PARENT_QUESTION_LIMIT } from '../data/constants';
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
    <main className="screen parent-board-screen">
      <section className="parent-board-top">
        <button className="board-back-button" onClick={onBack} type="button" aria-label="Quay lại">
          ‹
        </button>
        <div>
          <small>TalkTogether</small>
          <h1>Mẹ chọn câu hỏi</h1>
          <p>Chọn một câu để bắt đầu lượt nói với An.</p>
        </div>
        <div className="parent-topic-badge">
          <span>{topic.icon}</span>
          <strong>{topic.title}</strong>
          <small>{PARENT_QUESTION_LIMIT} câu hỏi</small>
        </div>
      </section>

      <section className="parent-board-body">
        <Progress step={1} />
        <section className="parent-question-panel">
          <div className="parent-question-panel-copy">
            <small>Chủ đề: {topic.title}</small>
            <strong>Câu nào phù hợp để mẹ hỏi An?</strong>
          </div>
          <span aria-hidden="true">💬</span>
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

      <section className="parent-board-bottom">
        <TurnActionButtons
          doneDisabled={questionIndex == null}
          onDone={onDone}
          onEnd={onEndConversation}
        />
      </section>
    </main>
  );
}
