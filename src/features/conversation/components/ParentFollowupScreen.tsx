import { Header, TurnActionButtons } from './shared';

type ParentFollowupScreenProps = {
  question: string;
  response: string;
  suggestions: readonly string[];
  selectedQuestion: string;
  onSelectQuestion: (question: string) => void;
  onContinue: () => void;
  onFinish: () => void;
  onBack: () => void;
};

export function ParentFollowupScreen({
  question,
  response,
  suggestions,
  selectedQuestion,
  onSelectQuestion,
  onContinue,
  onFinish,
  onBack,
}: ParentFollowupScreenProps) {
  return (
    <main className="screen">
      <Header title="Ba mẹ tiếp tục nhé!" subtitle="Gợi ý câu hỏi tiếp theo" onBack={onBack} />
      <section className="mini-conversation">
        <div className="bubble parent"><small>Mẹ</small>{question}</div>
        <div className="bubble child"><small>An</small>{response}</div>
      </section>
      <section className="followup-card">
        <span className="assistant-avatar">💬</span>
        <div>
          <small>Gợi ý tiếp theo</small>
          <h2>Chọn câu hỏi mẹ muốn hỏi An</h2>
          <p>Gợi ý được chọn từ chủ đề và câu trả lời vừa rồi của An.</p>
        </div>
      </section>
      <section className="question-stack">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            className={`question-card ${selectedQuestion === suggestion ? 'selected' : ''}`}
            onClick={() => onSelectQuestion(suggestion)}
          >
            <span className="question-bubble">💬</span>
            <span>{suggestion}</span>
            <span className="radio">{selectedQuestion === suggestion ? '✓' : ''}</span>
          </button>
        ))}
      </section>
      <TurnActionButtons
        doneDisabled={!selectedQuestion}
        onDone={onContinue}
        onEnd={onFinish}
      />
    </main>
  );
}
