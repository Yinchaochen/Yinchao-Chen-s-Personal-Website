import { useState, useRef, useCallback, useEffect, Suspense, lazy, useMemo } from 'react';
import { useApp, type Section } from './context/AppContext';
import Loader from './components/Loader';
import Header from './components/Header';
import PinLabel from './components/PinLabel';
import Pins from './components/Pins';
import Navigator from './components/Navigator';
import Accordion from './components/Accordion';
import BackButton from './components/BackButton';
import RotateWarning from './components/RotateWarning';
import LatestBlogNotice from './components/LatestBlogNotice';
import { useManagedAudioPlayback } from './hooks/useManagedAudioPlayback';
import { useAudioHintBubble } from './hooks/useAudioHintBubble';

const SceneCanvas = lazy(() => import('./components/Canvas'));

export default function App() {
  const { loaded, setActiveSection, activeSceneId, setActiveSceneId, audioRef, muted, setMuted } = useApp();
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [mouseMoved, setMouseMoved] = useState(false);
  const sceneSwitchAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneCloseAudioRef = useRef<HTMLAudioElement | null>(null);
  const {
    isBlocked: ambientIsBlocked,
    isPlaying: ambientIsPlaying,
    stopPlayback: stopAmbientPlayback,
  } = useManagedAudioPlayback({
    audioRef,
    muted,
    volume: 0.4,
  });
  const audioHintKey = useMemo(
    () => `home:${activeSceneId ?? 'landing'}`,
    [activeSceneId],
  );
  const showAudioHint = useAudioHintBubble({
    enabled: loaded && mouseMoved && !muted && ambientIsBlocked,
    hintKey: audioHintKey,
  });

  useEffect(() => {
    const h = () => { setMouseMoved(true); window.removeEventListener('mousemove', h); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const playSound = useCallback((audio: HTMLAudioElement | null, volume: number) => {
    if (muted) return;
    if (!audio) return;

    audio.volume = volume;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [muted]);

  const playSceneSwitchSound = useCallback(() => {
    playSound(sceneSwitchAudioRef.current, 0.85);
  }, [playSound]);

  const playSceneCloseSound = useCallback(() => {
    playSound(sceneCloseAudioRef.current, 0.85);
  }, [playSound]);

  const handleOpen = useCallback((s: Section) => {
    playSceneSwitchSound();
    setActiveSceneId(s.id);
    setTimeout(() => setActiveSection(s), 900);
  }, [playSceneSwitchSound, setActiveSection, setActiveSceneId]);

  const handleClose = useCallback(() => {
    playSceneCloseSound();
    setActiveSection(null);
    setActiveSceneId(null);
  }, [playSceneCloseSound, setActiveSection, setActiveSceneId]);

  const handleAudioToggle = useCallback(() => {
    if (!muted) {
      stopAmbientPlayback();
    }

    setMuted(!muted);
  }, [muted, setMuted, stopAmbientPlayback]);

  return (
    <div style={{ width: '100vw', height: '100svh', overflow: 'hidden', background: 'var(--color-loader)' }}>
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="auto" playsInline autoPlay />
      <audio ref={sceneSwitchAudioRef} src="/audio/click-se.mp3" preload="auto" playsInline />
      <audio ref={sceneCloseAudioRef} src="/audio/close-se.mp3" preload="auto" playsInline />

      <Suspense fallback={null}>
        <SceneCanvas activeSceneId={activeSceneId} />
      </Suspense>

      {/* HTML pin icons with glow effect */}
      <Pins
        onHover={setHoveredId}
        onClick={handleOpen}
        visible={loaded && !activeSceneId}
      />

      {loaded && !activeSceneId && <PinLabel hoveredId={hoveredId} />}

      <Header
        visible={loaded && mouseMoved}
        audioPlaying={!muted && ambientIsPlaying}
        showAudioHint={showAudioHint}
        onAudioToggle={handleAudioToggle}
      />

      <Navigator onOpen={handleOpen} />

      <Accordion />
      <LatestBlogNotice visible={loaded && !activeSceneId} />
      <BackButton onClose={handleClose} />

      {!loaded && <Loader />}

      <RotateWarning />
    </div>
  );
}
