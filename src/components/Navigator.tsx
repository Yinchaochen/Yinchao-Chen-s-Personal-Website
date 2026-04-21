import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { sections, useApp } from '../context/AppContext';

export default function Navigator({ onOpen }: { onOpen: (s: typeof sections[0]) => void }) {
  const { navOpen, setNavOpen, lang } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !wrapperRef.current) return;
    if (navOpen) {
      gsap.set(overlayRef.current, { display: 'flex' });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo(wrapperRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    } else {
      gsap.to([overlayRef.current, wrapperRef.current], {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => { if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' }); }
      });
    }
  }, [navOpen]);

  const open = (s: typeof sections[0]) => {
    setNavOpen(false);
    setTimeout(() => onOpen(s), 400);
  };

  return (
    <div
      ref={overlayRef}
      onClick={() => setNavOpen(false)}
      style={{
        display: 'none',
        position: 'fixed', inset: 0, zIndex: 29,
        backdropFilter: 'blur(20px)',
        background: 'rgba(250,250,250,0.25)',
        justifyContent: 'center', alignItems: 'center',
      }}
    >
      <div
        ref={wrapperRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-navigator)',
          width: 'calc(100vw - calc(var(--grid-val) * 2.5vw))',
          maxWidth: '900px',
          height: '75svh',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'calc(var(--grid-val) * .5vw)',
          padding: 'calc(var(--grid-val) * 1.5vw) calc(var(--grid-val) * 2.5vw)',
          alignContent: 'center',
          boxShadow: '1px 4px 12px rgba(0,0,0,0.25)',
          overflow: 'auto',
        }}
      >
        {/* Decorative border */}
        <img
          src="/svgs/borders.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute', top: '-1%', left: '-1%',
            width: '102%', height: '102%', pointerEvents: 'none',
            color: 'var(--color-primary)',
          }}
        />

        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => open(s)}
            style={{
              position: 'relative',
              background: s.color,
              border: 'none',
              padding: 'calc(var(--grid-val) * 1vw)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.3s cubic-bezier(.215,.61,.355,1), box-shadow 0.3s',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(44,46,44,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <span className="font-display fs-sm" style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--color-primary)' }}>
              {s.label[lang]}
            </span>
            <span className="font-body fs-xs" style={{ color: 'var(--color-dark)', opacity: 0.7 }}>
              {s.subtitle[lang]}
            </span>
          </button>
        ))}

        {/* Close button */}
        <button
          onClick={() => setNavOpen(false)}
          className="mm-shadow"
          style={{
            position: 'absolute',
            top: 'calc(var(--grid-val) * 2.5vw)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(var(--grid-val) * 1.75vw)',
            height: 'calc(var(--grid-val) * 1.75vw)',
            padding: 0, background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <img src="/svgs/close.svg" alt="Close" style={{ width: '100%', height: '100%' }} />
        </button>
      </div>
    </div>
  );
}
