import { useState, useCallback, useEffect } from 'react';
import { useApp, type Section } from './context/AppContext';
import Loader from './components/Loader';
import SceneCanvas from './components/Canvas';
import Header from './components/Header';
import PinLabel from './components/PinLabel';
import Pins from './components/Pins';
import Navigator from './components/Navigator';
import Accordion from './components/Accordion';
import BackButton from './components/BackButton';
import RotateWarning from './components/RotateWarning';

export default function App() {
  const { loaded, setActiveSection, activeSceneId, setActiveSceneId, audioRef } = useApp();
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [mouseMoved, setMouseMoved] = useState(false);

  useEffect(() => {
    const h = () => { setMouseMoved(true); window.removeEventListener('mousemove', h); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const handleOpen = useCallback((s: Section) => {
    setActiveSceneId(s.id);
    setTimeout(() => setActiveSection(s), 900);
  }, [setActiveSection, setActiveSceneId]);

  const handleClose = useCallback(() => {
    setActiveSection(null);
    setActiveSceneId(null);
  }, [setActiveSection, setActiveSceneId]);

  return (
    <div style={{ width: '100vw', height: '100svh', overflow: 'hidden', background: 'var(--color-loader)' }}>
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="auto" />

      <SceneCanvas activeSceneId={activeSceneId} />

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
