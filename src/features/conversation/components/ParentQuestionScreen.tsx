import { PARENT_QUESTION_LIMIT } from '../data/constants';
import type { Topic } from '../types';
import { Header, Progress, TurnActionButtons } from './shared';

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
    <main className="screen">
      <Header title="Gợi ý câu hỏi cho mẹ" subtitle={`Chủ đề: ${topic.title}`} onBack={onBack} />
      <Progress step={1} />
      <section className="assistant-card">
        <div className="assistant-avatar">💬</div>
        <div>
          <strong>Gợi ý câu hỏi phù hợp với chủ đề đã chọn</strong>
          <p>Chọn một câu để bắt đầu lượt nói của mẹ.</p>
        </div>
      </section>
      <section className="question-stack">
        {visibleQuestions.map((question, index) => (
          <button
            key={question}
            className={`question-card ${questionIndex === index ? 'selected' : ''}`}
            onClick={() => onPickQuestion(index)}
          >
            <span className="question-bubble">💬</span>
            <span>{question}</span>
            <span className="radio">{questionIndex === index ? '✓' : ''}</span>
          </button>
        ))}
      </section>
      <TurnActionButtons
        doneDisabled={questionIndex == null}
        onDone={onDone}
        onEnd={onEndConversation}
      />
    </main>
  );
}
