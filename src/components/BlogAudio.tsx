import { useCallback, useEffect, useRef, useState } from 'react';
import { acknowledgeEntryAudioPrompt, shouldShowEntryAudioPrompt } from '../lib/audioPrompt';
import { useManagedAudioPlayback } from '../hooks/useManagedAudioPlayback';
import AudioWaveIcon from './AudioWaveIcon';
import SoundPrompt from './SoundPrompt';

const STORAGE_KEY = 'blog-audio-muted';

function getStoredMutedState() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export default function BlogAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canShowEntryPromptRef = useRef(shouldShowEntryAudioPrompt());
  const [muted, setMuted] = useState(getStoredMutedState);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);
  const { ensurePlayback, isPlaying } = useManagedAudioPlayback({
    audioRef,
    muted,
    volume: 0.4,
    onBlocked: () => {
      if (canShowEntryPromptRef.current) {
        setShowPrompt(true);
      }
    },
    onResumed: () => {
      setShowPrompt(false);
    },
  });

  const handleEnablePrompt = useCallback(() => {
    acknowledgeEntryAudioPrompt();
    canShowEntryPromptRef.current = false;
    setShowPrompt(false);
    ensurePlayback();
  }, [ensurePlayback]);

  const handleDismissPrompt = useCallback(() => {
    acknowledgeEntryAudioPrompt();
    canShowEntryPromptRef.current = false;
    setShowPrompt(false);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((value) => {
      const next = !value;
      if (!next) {
        acknowledgeEntryAudioPrompt();
        canShowEntryPromptRef.current = false;
      }
      return next;
    });
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/blog-theme.mp3" loop preload="auto" playsInline autoPlay />
      {showPrompt && !muted && (
        <SoundPrompt onEnable={handleEnablePrompt} onDismiss={handleDismissPrompt} />
      )}
      <button
        onClick={toggleMuted}
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
        <AudioWaveIcon active={!muted && isPlaying} />
      </button>
    </>
  );
}
