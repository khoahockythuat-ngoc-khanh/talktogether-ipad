import { Header, TurnActionButtons } from './shared';

type SpokenResponseScreenProps = {
  response: string;
  onContinue: () => void;
  onReplay: () => void;
  onEndConversation: () => void;
  onBack: () => void;
};

export function SpokenResponseScreen({ response, onContinue, onReplay, onEndConversation, onBack }: SpokenResponseScreenProps) {
  return (
    <main className="screen center-screen">
      <Header title="An đã trả lời" subtitle="Ứng dụng phát câu vừa chọn" onBack={onBack} />
      <div className="celebrate">✨</div>
      <section className="spoken-card">
        <div className="spoken-face">😊</div>
        <small>An chọn</small>
        <h2>“{response}”</h2>
        <button className="voice-pill" onClick={onReplay}>🔊 Nghe lại</button>
      </section>
      <p className="encouragement">Tuyệt vời! Cùng tiếp tục cuộc trò chuyện nhé.</p>
      <TurnActionButtons onDone={onContinue} onEnd={onEndConversation} />
    </main>
  );
}
