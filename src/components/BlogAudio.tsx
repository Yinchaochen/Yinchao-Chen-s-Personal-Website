import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'blog-audio-muted';

function getStoredMutedState() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export default function BlogAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeRef = useRef<(() => void) | null>(null);
  const [muted, setMuted] = useState(getStoredMutedState);

  const clearResumeListeners = useCallback(() => {
    resumeRef.current?.();
    resumeRef.current = null;
  }, []);

  const queueResumeOnInteraction = useCallback(() => {
    if (resumeRef.current) return;

    const resume = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.play().catch(() => {});
      clearResumeListeners();
    };

    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    resumeRef.current = () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [clearResumeListeners]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;
    audio.muted = muted;

    if (muted) {
      audio.pause();
      clearResumeListeners();
      return;
    }

    audio.play().catch(() => {
      queueResumeOnInteraction();
    });

    return clearResumeListeners;
  }, [clearResumeListeners, muted, queueResumeOnInteraction]);

  return (
    <>
      <audio ref={audioRef} src="/audio/blog-theme.mp3" loop preload="metadata" />
      <button
        onClick={() => setMuted((value) => !value)}
        title={muted ? 'Enable blog music' : 'Mute blog music'}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 40,
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        className="mm-shadow"
      >
        <img
          src="/svgs/audio_bg.svg"
          alt=""
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        <svg
          width="55%"
          height="55%"
          viewBox="0 0 20 16"
          fill="none"
          style={{ position: 'relative' }}
        >
          {muted ? (
            <>
              <line x1="2" y1="2" x2="18" y2="14" stroke="#68142b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="18" y1="2" x2="2" y2="14" stroke="#68142b" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x="0" y="4" width="2" height="8" rx="1" fill="#68142b" opacity="0.4" />
              <rect x="4" y="2" width="2" height="12" rx="1" fill="#68142b" opacity="0.6" />
              <rect x="8" y="0" width="2" height="16" rx="1" fill="#68142b" />
              <rect x="12" y="3" width="2" height="10" rx="1" fill="#68142b" opacity="0.6" />
              <rect x="16" y="6" width="2" height="4" rx="1" fill="#68142b" opacity="0.4" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
