import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { sections, type Section } from '../context/AppContext';

const THEMES: Record<string, { bg: string; color: string }> = {
  programming: { bg: '#eef6ff', color: '#00018d' },
  photography: { bg: '#e2ffec', color: '#326055' },
  youtube:     { bg: '#fffec5', color: '#855119' },
  journey:     { bg: '#edd7ff', color: '#44008d' },
  social:      { bg: '#e0fff8', color: '#054041' },
};

function PinIcon({ section, onHover, onClick, visible }: {
  section: Section;
  onHover: (id: string | null) => void;
  onClick: (s: Section) => void;
  visible: boolean;
}) {
  const rootRef  = useRef<HTMLDivElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<gsap.core.Tween | null>(null);
  const { bg, color } = THEMES[section.id] ?? { bg: '#fafafa', color: '#2c2e2c' };

  /* Start (or restart) the idle radial glow pulse from current scale */
  const startPulse = useCallback(() => {
    if (!glowRef.current) return;
    pulseRef.current?.kill();
    const from = (gsap.getProperty(glowRef.current, 'scaleX') as number) || 2.2;
    pulseRef.current = gsap.fromTo(
      glowRef.current,
      { scale: from },
      { scale: 3.4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }
    );
  }, []);

  useEffect(() => {
    gsap.set(glowRef.current, { scale: 2.2 }); // set base before first pulse
    startPulse();
    return () => { pulseRef.current?.kill(); };
  }, [startPulse]);

  /* Visibility — fade-in matches the 1.45s scene transition; clicks
     are blocked until the fade completes so a half-faded pin can't
     interrupt the closing scene tween. */
  useEffect(() => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    el.style.pointerEvents = 'none';
    if (!visible) document.body.style.cursor = 'default';

    gsap.to(el, {
      opacity: visible ? 1 : 0,
      duration: visible ? 1.45 : 0.5,
      ease: visible ? 'sine.inOut' : 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        if (visible) el.style.pointerEvents = 'auto';
      },
    });
  }, [visible]);

  const handleEnter = () => {
    if (!visible) return;
    /* Glow converges: scale shrinks to just outside the circle */
    pulseRef.current?.kill();
    gsap.to(glowRef.current, { scale: 1.25, duration: 0.4, ease: 'power3.out', overwrite: true });
    document.body.style.cursor = 'pointer';
    onHover(section.id);
  };

  const handleLeave = () => {
    /* Animate back to base pulse range, then restart continuous pulse */
    gsap.to(glowRef.current, {
      scale: 2.2, duration: 0.6, ease: 'sine.inOut', overwrite: true,
      onComplete: startPulse,
    });
    document.body.style.cursor = 'default';
    onHover(null);
  };

  const size = 'clamp(32px, calc(var(--grid-val) * 2vw), 58px)';

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        left: `${section.position[0] * 100}vw`,
        top:  `${section.position[1] * 100}vh`,
        transform: 'translate(-50%, -50%)',
        width: size, height: size,
        opacity: 0,
        zIndex: 10,
        cursor: 'pointer',
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => { if (visible) onClick(section); }}
    >
      {/* Radial glow — same footprint as button, scaled up by GSAP */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, #ffcc4488 0%, #ffaa0044 45%, transparent 72%)`,
          transformOrigin: 'center',
          pointerEvents: 'none',
        }}
      />

      {/* Circle button */}
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: bg,
        border: `2px solid ${color}`,
        boxShadow: `inset 0 0 0 3px ${bg}, inset 0 0 0 5px ${color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        {/* Hand icon via CSS mask so color is fully controllable */}
        <div style={{
          width: '52%', height: '52%',
          WebkitMask: 'url(/svgs/hand-pin.svg) no-repeat center/contain',
          mask: 'url(/svgs/hand-pin.svg) no-repeat center/contain',
          background: color,
        }} />
      </div>
    </div>
  );
}

export default function Pins({ onHover, onClick, visible }: {
  onHover: (id: string | null) => void;
  onClick: (s: Section) => void;
  visible: boolean;
}) {
  return (
    <>
      {sections.map(s => (
        <PinIcon key={s.id} section={s} onHover={onHover} onClick={onClick} visible={visible} />
      ))}
    </>
  );
}
