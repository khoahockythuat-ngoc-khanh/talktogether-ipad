import { TurnActionButtons } from './shared';

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
    <main className="screen parent-board-screen followup-board-screen">
      <section className="parent-board-top">
        <button className="board-back-button" onClick={onBack} type="button" aria-label="Quay lại">
          ‹
        </button>
        <div>
          <small>TalkTogether</small>
          <h1>Câu hỏi tiếp theo</h1>
          <p>Chọn một câu để tiếp tục cuộc trò chuyện.</p>
        </div>
        <div className="parent-topic-badge">
          <span>💬</span>
          <strong>Tiếp tục</strong>
          <small>{suggestions.length} gợi ý</small>
        </div>
      </section>

      <section className="parent-board-body">
        <section className="board-conversation-recap" aria-label="Câu vừa trao đổi">
          <div className="recap-bubble parent"><small>Mẹ</small>{question}</div>
          <div className="recap-bubble child"><small>An</small>{response}</div>
        </section>
        <section className="parent-question-panel">
          <div className="parent-question-panel-copy">
            <small>Gợi ý tiếp theo</small>
            <strong>Mẹ muốn hỏi An câu nào?</strong>
          </div>
          <span aria-hidden="true">💬</span>
        </section>
        <section className="parent-question-grid" aria-label="Danh sách câu hỏi tiếp theo">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`parent-question-card ${selectedQuestion === suggestion ? 'selected' : ''}`}
              onClick={() => onSelectQuestion(suggestion)}
            >
              <span className="parent-question-number">{index + 1}</span>
              <strong>{suggestion}</strong>
              <span className="parent-question-check">{selectedQuestion === suggestion ? '✓' : ''}</span>
            </button>
          ))}
        </section>
      </section>

      <section className="parent-board-bottom">
        <TurnActionButtons
          doneDisabled={!selectedQuestion}
          onDone={onContinue}
          onEnd={onFinish}
        />
      </section>
    </main>
  );
}
