import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';

export default function BackButton({ onClose }: { onClose: () => void }) {
  const { activeSection } = useApp();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (activeSection) {
      gsap.fromTo(ref.current,
        { y: 40, opacity: 0, pointerEvents: 'none' },
        { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: 'power3.out', delay: 1.1 }
      );
    } else {
      gsap.to(ref.current, { y: 40, opacity: 0, pointerEvents: 'none', duration: 0.3, ease: 'power2.in' });
    }
  }, [activeSection]);

  return (
    <button
      ref={ref}
      onClick={onClose}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--grid-val) * 1.2vw)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        opacity: 0,
        pointerEvents: 'none',
        filter: 'drop-shadow(2px 2px rgba(44,46,44,0.3))',
        transition: 'filter 0.3s cubic-bezier(.215,.61,.355,1)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 0 transparent)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(2px 2px rgba(44,46,44,0.3))'; }}
    >
      <img
        src="/svgs/close.svg"
        alt="close"
        style={{ width: 'calc(var(--grid-val) * 1.4vw)', minWidth: '36px', maxWidth: '52px', display: 'block' }}
      />
    </button>
  );
}
