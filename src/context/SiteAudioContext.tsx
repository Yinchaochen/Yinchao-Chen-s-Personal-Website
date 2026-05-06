import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useManagedAudioPlayback } from '../hooks/useManagedAudioPlayback';

type AudioTrack = 'ambient' | 'blog' | 'photography';

interface SiteAudioContextType {
  muted: boolean;
  setMuted: (value: boolean) => void;
  audioPlaying: boolean;
  audioBlocked: boolean;
  ensureAudioPlayback: () => void;
  stopAudioPlayback: () => void;
  currentTrack: AudioTrack;
}

const AUDIO_STORAGE_KEY = 'site-audio-muted';
const LEGACY_BLOG_AUDIO_STORAGE_KEY = 'blog-audio-muted';
const AMBIENT_AUDIO_SRC = '/audio/ambient.mp3';
const BLOG_AUDIO_SRC = '/audio/blog-theme.mp3';
const PHOTOGRAPHY_AUDIO_SRC = '/audio/photography-theme.mp3';

const SiteAudioContext = createContext<SiteAudioContextType | null>(null);

function getStoredMutedState() {
  if (typeof window === 'undefined') return false;

  const storedValue = window.localStorage.getItem(AUDIO_STORAGE_KEY);
  if (storedValue !== null) {
    return storedValue === 'true';
  }

  return window.localStorage.getItem(LEGACY_BLOG_AUDIO_STORAGE_KEY) === 'true';
}

function getTrackFromPath(pathname: string): AudioTrack {
  if (pathname.startsWith('/photography')) {
    return 'photography';
  }
  if (pathname.startsWith('/blog') || pathname.startsWith('/write')) {
    return 'blog';
  }

  return 'ambient';
}

function getAudioSrc(track: AudioTrack) {
  if (track === 'photography') return PHOTOGRAPHY_AUDIO_SRC;
  if (track === 'blog') return BLOG_AUDIO_SRC;
  return AMBIENT_AUDIO_SRC;
}

export function SiteAudioProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mutedState, setMutedState] = useState(getStoredMutedState);
  const currentTrack = getTrackFromPath(location.pathname);
  const audioSrc = getAudioSrc(currentTrack);
  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
  }, []);
  const {
    ensurePlayback,
    isBlocked: audioBlocked,
    isPlaying: audioPlaying,
    stopPlayback: stopAudioPlayback,
  } = useManagedAudioPlayback({
    audioRef,
    muted: mutedState,
    volume: 0.4,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUDIO_STORAGE_KEY, String(mutedState));
  }, [mutedState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    if (!mutedState) {
      ensurePlayback();
    }
  }, [audioSrc, ensurePlayback, mutedState]);

  const value = useMemo<SiteAudioContextType>(() => ({
    muted: mutedState,
    setMuted,
    audioPlaying,
    audioBlocked,
    ensureAudioPlayback: ensurePlayback,
    stopAudioPlayback,
    currentTrack,
  }), [audioBlocked, audioPlaying, currentTrack, ensurePlayback, mutedState, setMuted, stopAudioPlayback]);

  return (
    <SiteAudioContext.Provider value={value}>
      <audio ref={audioRef} src={audioSrc} loop preload="auto" playsInline autoPlay />
      {children}
    </SiteAudioContext.Provider>
  );
}

export function useSiteAudio() {
  const context = useContext(SiteAudioContext);

  if (!context) {
    throw new Error('useSiteAudio must be used within a SiteAudioProvider.');
  }

  return context;
}
