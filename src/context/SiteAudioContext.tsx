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

type AudioTrack = 'ambient' | 'library' | 'none';

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
const LAST_TRACK_STORAGE_KEY = 'blog-audio-last-track';
const AMBIENT_AUDIO_SRC = '/audio/ambient.mp3';
const LIBRARY_TRACKS = [
  '/audio/blog-theme.mp3',
  '/audio/photography-theme.mp3',
  '/audio/blog/home-to-you-hidden-tapes.mp3',
  '/audio/blog/solstice-waes-hael.mp3',
  '/audio/blog/returning-christian-wade.mp3',
  '/audio/blog/stillbrook-formosa.mp3',
  '/audio/blog/bending-trees-aur.mp3',
  '/audio/blog/who-will-remember-a-taylor.mp3',
];

function pickLibraryTrack() {
  if (typeof window === 'undefined') return LIBRARY_TRACKS[0];

  const lastTrack = window.localStorage.getItem(LAST_TRACK_STORAGE_KEY);
  const candidates = LIBRARY_TRACKS.filter((track) => track !== lastTrack);
  const pick = candidates[Math.floor(Math.random() * candidates.length)] ?? LIBRARY_TRACKS[0];
  window.localStorage.setItem(LAST_TRACK_STORAGE_KEY, pick);

  return pick;
}

function getRandomizeKey(pathname: string) {
  const match = pathname.match(/^\/blog\/(.+)$/);
  if (match) return `post:${match[1]}`;
  if (pathname.startsWith('/photography')) return 'photography';
  return null;
}

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
  if (pathname.startsWith('/photography') || pathname.startsWith('/write')) {
    return 'library';
  }
  if (pathname.startsWith('/blog')) {
    return getRandomizeKey(pathname) ? 'library' : 'none';
  }

  return 'ambient';
}

function getAudioSrc(track: AudioTrack, librarySrc: string) {
  if (track === 'ambient') return AMBIENT_AUDIO_SRC;
  return librarySrc;
}

export function SiteAudioProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mutedState, setMutedState] = useState(getStoredMutedState);
  const [librarySrc, setLibrarySrc] = useState(pickLibraryTrack);
  const randomizeKeyRef = useRef(getRandomizeKey(location.pathname));
  const currentTrack = getTrackFromPath(location.pathname);
  const audioSrc = getAudioSrc(currentTrack, librarySrc);

  useEffect(() => {
    const key = getRandomizeKey(location.pathname);
    if (key && key !== randomizeKeyRef.current) {
      setLibrarySrc(pickLibraryTrack());
    }
    randomizeKeyRef.current = key;
  }, [location.pathname]);
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
    muted: mutedState || currentTrack === 'none',
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
