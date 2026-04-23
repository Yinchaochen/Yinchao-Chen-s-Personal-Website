import { useState, useRef, useCallback, useEffect, Suspense, lazy } from 'react';
import { useApp, type Section } from './context/AppContext';
import Loader from './components/Loader';
import Header from './components/Header';
import PinLabel from './components/PinLabel';
import Pins from './components/Pins';
import Navigator from './components/Navigator';
import Accordion from './components/Accordion';
import BackButton from './components/BackButton';
import RotateWarning from './components/RotateWarning';

const SceneCanvas = lazy(() => import('./components/Canvas'));

export default function App() {
  const { loaded, setActiveSection, activeSceneId, setActiveSceneId, audioRef, muted } = useApp();
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [mouseMoved, setMouseMoved] = useState(false);
  const ambientResumeRef = useRef<(() => void) | null>(null);
  const sceneSwitchAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneCloseAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const h = () => { setMouseMoved(true); window.removeEventListener('mousemove', h); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const clearAmbientResumeListeners = useCallback(() => {
    ambientResumeRef.current?.();
    ambientResumeRef.current = null;
  }, []);

  const queueAmbientResumeOnInteraction = useCallback(() => {
    if (ambientResumeRef.current) return;

    const resume = () => {
      const audio = audioRef.current;
      if (!audio || muted) return;

      audio.play().catch(() => {});
      clearAmbientResumeListeners();
    };

    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    ambientResumeRef.current = () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [audioRef, clearAmbientResumeListeners, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const ensurePlayback = () => {
      audio.play().catch(() => {
        queueAmbientResumeOnInteraction();
      });
    };

    audio.volume = 0.4;
    audio.muted = muted;

    if (muted) {
      audio.pause();
      clearAmbientResumeListeners();
      return;
    }

    ensurePlayback();

    const handleVisibilityChange = () => {
      if (!document.hidden && audio.paused) {
        ensurePlayback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearAmbientResumeListeners();
    };
  }, [audioRef, clearAmbientResumeListeners, muted, queueAmbientResumeOnInteraction]);

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

  return (
    <div style={{ width: '100vw', height: '100svh', overflow: 'hidden', background: 'var(--color-loader)' }}>
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="metadata" playsInline />
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

      <Header visible={loaded && mouseMoved} />

      <Navigator onOpen={handleOpen} />

      <Accordion />
      <BackButton onClose={handleClose} />

      {!loaded && <Loader />}

      <RotateWarning />
    </div>
  );
}
