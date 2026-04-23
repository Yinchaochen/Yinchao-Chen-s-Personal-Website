import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';
import { useSiteAudio } from '../context/SiteAudioContext';

export default function Loader() {
  const { setLoaded, lang, setLang } = useApp();
  const { ensureAudioPlayback } = useSiteAudio();
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const audioHintRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const names = ['Yinchao Chen'];
  const subtitles = ['Programmer · Photographer · Video Creator'];
  const langs = ['en'] as const;

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(titleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 0.6)
      .fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.4)
      .fromTo(btnRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', onComplete: () => setReady(true) }, 2.2)
      .fromTo(audioHintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.8);

    return () => { tl.kill(); };
  }, []);


  const enter = () => {
    if (!ready) return;

    // Start audio (must be inside user gesture)
    ensureAudioPlayback();

    const tl = gsap.timeline({ onComplete: () => setLoaded(true) });
    tl.to([titleRef.current, contentRef.current, btnRef.current, audioHintRef.current], {
      opacity: 0, y: -20, duration: 0.5, ease: 'power2.in', stagger: 0.05
    })
    .to(bgRef.current, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 1.2,
      ease: 'power3.inOut',
    }, 0.4);
  };

  return (
    <div
      ref={bgRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--color-loader)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        clipPath: 'circle(150% at 50% 50%)',
        cursor: ready ? 'pointer' : 'default',
      }}
      onClick={enter}
    >
      {/* Title */}
      <h1
        ref={titleRef}
        className="font-display fs-xl"
        style={{
          opacity: 0,
          color: 'var(--color-primary)',
          textAlign: 'center',
          fontStyle: 'italic',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          transition: 'all 0.6s ease',
        }}
      >
        {names[0]}
      </h1>

      {/* Subtitle */}
      <p
        ref={contentRef}
        className="font-body fs-md"
        style={{
          opacity: 0,
          color: 'var(--color-primary)',
          marginTop: 'calc(var(--grid-val) * .5vw)',
          textAlign: 'center',
          fontStyle: 'italic',
          transition: 'all 0.6s ease',
        }}
      >
        {subtitles[0]}
      </p>

      {/* Enter button */}
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); enter(); }}
        className="mm-shadow"
        style={{
          opacity: 0,
          position: 'relative',
          marginTop: 'calc(var(--grid-val) * 1.5vw)',
          width: 'calc(var(--grid-val) * 8vw)',
          aspectRatio: '16/3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          cursor: ready ? 'pointer' : 'default',
        }}
      >
        <img
          src="/svgs/button_bg.svg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        <span
          className="font-display fs-sm"
          style={{
            position: 'relative',
            color: 'var(--color-primary)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {lang === 'zh' ? '进入' : lang === 'de' ? 'Eintreten' : 'Enter'}
        </span>
      </button>

      {/* Audio hint */}
      <div
        ref={audioHintRef}
        className="font-display fs-xs"
        style={{
          opacity: 0,
          position: 'absolute',
          bottom: 'calc(var(--grid-val) * 1vw)',
          left: 0, right: 0,
          textAlign: 'center',
          color: 'var(--color-accent)',
          fontStyle: 'italic',
          padding: '0 calc(var(--grid-val) * .5vw)',
        }}
      >
        {lang === 'zh' ? '此体验包含音频 · 请调高音量' : lang === 'de' ? 'Dieses Erlebnis enthält Audio' : 'This experience includes audio'}
      </div>

      {/* Language switcher */}
      <div style={{
        position: 'absolute',
        top: 'calc(var(--grid-val) * .85vw)',
        right: 'calc(var(--grid-val) * 1vw)',
        display: 'flex',
        gap: 'calc(var(--grid-val) * .5vw)',
      }}>
        {(['zh', 'en', 'de'] as const).map(l => (
          <button
            key={l}
            onClick={e => { e.stopPropagation(); setLang(l); }}
            className="font-body fs-xs"
            style={{
              color: 'var(--color-primary)',
              fontWeight: lang === l ? 700 : 400,
              opacity: lang === l ? 1 : 0.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {l === 'zh' ? '中' : l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
