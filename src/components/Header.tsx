import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';
import { useSiteAudio } from '../context/SiteAudioContext';
import AudioWaveIcon from './AudioWaveIcon';
import AudioHintBubble from './AudioHintBubble';

export default function Header({
  visible,
  audioPlaying,
  showAudioHint,
  onAudioToggle,
}: {
  visible: boolean;
  audioPlaying: boolean;
  showAudioHint: boolean;
  onAudioToggle: () => void;
}) {
  const { lang, setLang, navOpen, setNavOpen } = useApp();
  const { muted } = useSiteAudio();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (visible && ref.current) {
      gsap.to(ref.current, { opacity: 1, duration: 1, delay: 0.3 });
    }
  }, [visible]);

  return (
    <header
      ref={ref}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw',
        zIndex: 30, opacity: 0, pointerEvents: 'none',
        padding: '0 calc(var(--grid-val) * 1vw)',
        paddingTop: 'calc(var(--grid-val) * .5vw)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}
    >
      {/* Left: Nav toggle */}
      <button
        onClick={() => setNavOpen(!navOpen)}
        className="mm-shadow font-display fs-sm"
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'calc(var(--grid-val) * 2.5vw)',
          aspectRatio: '7/2',
          color: 'var(--color-primary)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        <img
          src="/svgs/button_bg.svg"
          alt=""
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        <span style={{ position: 'relative' }}>
          {navOpen ? (lang === 'zh' ? '关闭' : lang === 'de' ? 'Schließen' : 'Close') : (lang === 'zh' ? '菜单' : lang === 'de' ? 'Menü' : 'Menu')}
        </span>
      </button>

      {/* Center: Name / Logo */}
      <div
        className="font-display fs-sm"
        style={{
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontStyle: 'italic',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        {lang === 'zh' ? '陈尹超' : 'Yinchao Chen'}
      </div>

      {/* Right: language switcher + audio */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: 'calc(var(--grid-val) * .4vw)',
        pointerEvents: 'auto',
      }}>
        {(['zh', 'en', 'de'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className="font-body fs-xs"
            style={{
              color: 'var(--color-primary)',
              fontWeight: lang === l ? 700 : 400,
              opacity: lang === l ? 1 : 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            {l === 'zh' ? '中' : l.toUpperCase()}
          </button>
        ))}

        {/* Audio toggle */}
        <div
          style={{
            position: 'relative',
            width: 'calc(var(--grid-val) * 1.1vw)',
            height: 'calc(var(--grid-val) * 1.1vw)',
            marginLeft: 'calc(var(--grid-val) * .25vw)',
          }}
        >
          <AudioHintBubble
            visible={showAudioHint}
            text="You can turn off the music here."
            top="50%"
          />
          <button
            onClick={onAudioToggle}
            className="mm-shadow"
            title={muted ? 'Unmute' : 'Mute'}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <img src="/svgs/audio_bg.svg" alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
            <AudioWaveIcon active={audioPlaying} />
          </button>
        </div>
      </div>
    </header>
  );
}
