import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useManagedAudioPlayback } from '../hooks/useManagedAudioPlayback';
import { useAudioHintBubble } from '../hooks/useAudioHintBubble';
import AudioWaveIcon from './AudioWaveIcon';
import AudioHintBubble from './AudioHintBubble';

const STORAGE_KEY = 'blog-audio-muted';

function getStoredMutedState() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export default function BlogAudio() {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(getStoredMutedState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  const { isPlaying } = useManagedAudioPlayback({
    audioRef,
    muted,
    volume: 0.4,
  });
  const showAudioHint = useAudioHintBubble({
    enabled: !muted && !isPlaying,
    hintKey: `blog:${location.pathname}`,
  });

  const toggleMuted = useCallback(() => {
    setMuted((value) => !value);
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/blog-theme.mp3" loop preload="auto" playsInline autoPlay />
      <div
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 40,
          width: '44px',
          height: '44px',
        }}
      >
        <AudioHintBubble
          visible={showAudioHint}
          text="Click the sound icon to play music."
          bottom="2px"
        />
        <button
          onClick={toggleMuted}
          title={muted ? 'Enable blog music' : 'Mute blog music'}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
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
      </div>
    </>
  );
}
