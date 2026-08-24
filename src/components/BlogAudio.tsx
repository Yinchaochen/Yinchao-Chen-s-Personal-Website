import { useCallback } from 'react';
import { useAudioHintBubble } from '../hooks/useAudioHintBubble';
import { useSiteAudio } from '../context/SiteAudioContext';
import AudioWaveIcon from './AudioWaveIcon';
import AudioHintBubble from './AudioHintBubble';

export default function BlogAudio() {
  const { muted, setMuted, audioPlaying, stopAudioPlayback, nextTrack } = useSiteAudio();
  const showAudioHint = useAudioHintBubble({
    enabled: !muted && audioPlaying,
    hintKey: 'blog:audio-toggle',
  });

  const toggleMuted = useCallback(() => {
    if (!muted) {
      stopAudioPlayback();
    }

    setMuted(!muted);
  }, [muted, setMuted, stopAudioPlayback]);

  return (
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
      {!muted && (
        <button
          onClick={nextTrack}
          title="Next track"
          style={{
            position: 'absolute',
            bottom: '52px',
            left: 0,
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
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'relative' }}>
            <path d="M5 5.5l9 6.5-9 6.5v-13zM16.5 5.5h2.5v13h-2.5z" fill="#68142b" />
          </svg>
        </button>
      )}
      <AudioHintBubble
        visible={showAudioHint}
        text="You can turn off the music here."
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
        <AudioWaveIcon active={!muted && audioPlaying} />
      </button>
    </div>
  );
}
