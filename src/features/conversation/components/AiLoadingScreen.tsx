import type { LoadingDestination } from '../types';

export function AiLoadingScreen({ destination }: { destination: LoadingDestination | null }) {
  const copy = destination === 'child'
    ? {
        title: 'Đang mở thẻ cho An',
        subtitle: 'Chuẩn bị lựa chọn phù hợp với câu hỏi vừa chọn.',
      }
    : {
        title: 'Đang chuẩn bị câu hỏi',
        subtitle: 'Sắp tới lượt của mẹ.',
      };

  return (
    <main className="screen ai-loading-screen" aria-live="polite">
      <section className="ai-loading-card">
        <div className="ai-loader-avatar">💬</div>
        <div className="ai-loader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </section>
    </main>
  );
}
