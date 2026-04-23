interface SoundPromptProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export default function SoundPrompt({ onEnable, onDismiss }: SoundPromptProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '28px',
        transform: 'translateX(-50%)',
        zIndex: 60,
        width: 'min(calc(100vw - 32px), 420px)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'rgba(250, 249, 247, 0.96)',
        border: '1px solid rgba(104, 20, 43, 0.14)',
        boxShadow: '0 18px 45px rgba(44, 46, 44, 0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '15px',
          fontStyle: 'italic',
          color: '#68142b',
          marginBottom: '4px',
        }}>
          This page has sound
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          lineHeight: 1.5,
          color: 'rgba(44, 46, 44, 0.72)',
        }}>
          If your browser blocks autoplay, tap once to enable the music.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={onDismiss}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(44, 46, 44, 0.55)',
          }}
        >
          Later
        </button>
        <button
          onClick={onEnable}
          className="mm-shadow"
          style={{
            position: 'relative',
            minWidth: '120px',
            height: '38px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#68142b',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <img
            src="/svgs/button_bg.svg"
            alt=""
            aria-hidden
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          />
          <span style={{ position: 'relative' }}>Enable Sound</span>
        </button>
      </div>
    </div>
  );
}
