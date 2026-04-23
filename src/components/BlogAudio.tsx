import { useCallback } from 'react';
import { useAudioHintBubble } from '../hooks/useAudioHintBubble';
import { useSiteAudio } from '../context/SiteAudioContext';
import AudioWaveIcon from './AudioWaveIcon';
import AudioHintBubble from './AudioHintBubble';

export default function BlogAudio() {
  const { muted, setMuted, audioPlaying, stopAudioPlayback } = useSiteAudio();
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
