import type { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function Header({ title, subtitle, onBack, right }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-side">
        {onBack ? (
          <button className="icon-button" onClick={onBack} aria-label="Quay lại">
            ‹
          </button>
        ) : (
          <div className="brand-mark">Tt</div>
        )}
      </div>
      <div className="topbar-copy">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="topbar-side topbar-right">{right}</div>
    </header>
  );
}

export function Progress({ step }: { step: number }) {
  const steps = ['Chủ đề', 'Mẹ', 'Con', 'Hội thoại'];
  return (
    <div className="progress-wrap" aria-label={`Bước ${step + 1} trên ${steps.length}`}>
      {steps.map((label, index) => (
        <div className={`progress-item ${index <= step ? 'active' : ''}`} key={label}>
          <span className="progress-dot">{index + 1}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

type TurnActionButtonsProps = {
  onDone: () => void;
  onEnd: () => void;
  doneDisabled?: boolean;
};

export function TurnActionButtons({ onDone, onEnd, doneDisabled = false }: TurnActionButtonsProps) {
  return (
    <section className="turn-actions" aria-label="Điều khiển lượt trò chuyện">
      <button className="turn-action done" disabled={doneDisabled} onClick={onDone}>
        <span className="turn-action-orb">✓</span>
        <span className="turn-action-label">Xong lượt</span>
      </button>
      <button className="turn-action end" onClick={onEnd}>
        <span className="turn-action-orb">■</span>
        <span className="turn-action-label">Kết thúc cuộc trò chuyện</span>
      </button>
    </section>
  );
}
