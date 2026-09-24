import { TurnActionButtons } from './shared';

type SpokenResponseScreenProps = {
  response: string;
  onContinue: () => void;
  onReplay: () => void;
  onEndConversation: () => void;
  onBack: () => void;
};

export function SpokenResponseScreen({ response, onContinue, onReplay, onEndConversation, onBack }: SpokenResponseScreenProps) {
  return (
    <main className="screen center-screen spektrum-spoken-screen">
      <header className="spektrum-parent-topbar spektrum-spoken-topbar">
        <div className="spektrum-brand-group">
          <button className="spektrum-back-button" onClick={onBack} type="button" aria-label="Quay lại">
            ‹
          </button>
          <img className="spektrum-logo" src="/brand/spektrum-primary-logo.png" alt="Spektrum" />
        </div>

        <div className="polished-profile-name spektrum-spoken-profile">
          <span className="polished-profile-avatar" aria-hidden="true">👦🏻</span>
          <strong>Bảo An</strong>
        </div>
      </header>

      <section className="spektrum-spoken-body">
        <div className="spektrum-spoken-copy">
          <p>An đã trả lời</p>
          <h1>Ứng dụng vừa phát câu con chọn</h1>
        </div>

        <section className="spoken-card spektrum-spoken-card">
          <div className="spoken-face">😊</div>
          <small>Bảo An chọn</small>
          <h2>“{response}”</h2>
          <button className="voice-pill" onClick={onReplay} type="button">🔊 Nghe lại</button>
        </section>

        <p className="encouragement spektrum-encouragement">Tuyệt vời! Cùng tiếp tục cuộc trò chuyện nhé.</p>
      </section>

      <footer className="spektrum-spoken-footer">
        <TurnActionButtons onDone={onContinue} onEnd={onEndConversation} />
      </footer>
    </main>
  );
}
