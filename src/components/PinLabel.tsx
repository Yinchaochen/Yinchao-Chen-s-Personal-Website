import { sections, useApp } from '../context/AppContext';

export default function PinLabel({ hoveredId }: { hoveredId: string | null }) {
  const { lang } = useApp();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
      {sections.map(s => {
        const visible = hoveredId === s.id;
        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.position[0] * 100}%`,
              top: `${s.position[1] * 100}%`,
              transform: `translate(-50%, 52px) translateY(${visible ? 0 : -8}px)`,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              background: 'rgba(44,46,44,0.65)',
              backdropFilter: 'blur(6px)',
              borderRadius: '2px',
              padding: '3px 10px',
              color: '#fafafa',
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'max(10px, 0.7vw)',
              fontStyle: 'italic',
              fontWeight: 400,
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            {s.label[lang]}
          </div>
        );
      })}
    </div>
  );
}
