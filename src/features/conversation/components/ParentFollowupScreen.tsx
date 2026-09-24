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
    <main className="screen parent-board-screen followup-board-screen spektrum-parent-screen spektrum-followup-screen">
      <header className="spektrum-parent-topbar">
        <div className="spektrum-brand-group">
          <button className="spektrum-back-button" onClick={onBack} type="button" aria-label="Quay lại">
            ‹
          </button>
          <img className="spektrum-logo" src="/brand/spektrum-primary-logo.png" alt="Spektrum" />
        </div>

        <div className="parent-topic-badge spektrum-parent-topic-pill">
          <span className="spektrum-topic-icon" aria-hidden="true">💬</span>
          <span>
            <strong>Tiếp tục</strong>
            <small>{suggestions.length} gợi ý</small>
          </span>
        </div>
      </header>

      <section className="parent-board-body spektrum-parent-body">
        <section className="board-conversation-recap" aria-label="Câu vừa trao đổi">
          <div className="recap-bubble parent"><small>Mẹ</small>{question}</div>
          <div className="recap-bubble child"><small>Trẻ</small>{response}</div>
        </section>
        <section className="parent-question-panel">
          <div className="parent-question-panel-copy">
            <small>Gợi ý tiếp theo</small>
            <strong>Mẹ muốn hỏi gì?</strong>
          </div>
          <span aria-hidden="true">♡</span>
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

      <footer className="parent-board-bottom spektrum-parent-bottom">
        <TurnActionButtons
          doneDisabled={!selectedQuestion}
          onDone={onContinue}
          onEnd={onFinish}
        />
      </footer>
    </main>
  );
}
