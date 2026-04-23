import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface UseManagedAudioPlaybackOptions {
  audioRef: RefObject<HTMLAudioElement | null>;
  muted: boolean;
  volume?: number;
  checkerIntervalMs?: number;
  onBlocked?: () => void;
  onResumed?: () => void;
}

function isAudioEffectivelyPlaying(audio: HTMLAudioElement) {
  return !audio.paused && !audio.ended && audio.readyState >= 2 && !audio.muted;
}

export function useManagedAudioPlayback({
  audioRef,
  muted,
  volume = 0.4,
  checkerIntervalMs = 2500,
  onBlocked,
  onResumed,
}: UseManagedAudioPlaybackOptions) {
  const resumeRef = useRef<(() => void) | null>(null);
  const blockedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const clearResumeListeners = useCallback(() => {
    resumeRef.current?.();
    resumeRef.current = null;
  }, []);

  const syncPlaybackState = useCallback(() => {
    const audio = audioRef.current;
    setIsPlaying(Boolean(audio && isAudioEffectivelyPlaying(audio)));
  }, [audioRef]);

  const handlePlaybackSuccess = useCallback(() => {
    const wasBlocked = blockedRef.current;

    blockedRef.current = false;
    setIsBlocked(false);
    clearResumeListeners();
    setIsPlaying(true);

    if (wasBlocked) {
      onResumed?.();
    }
  }, [clearResumeListeners, onResumed]);

  const queueResumeOnInteraction = useCallback(() => {
    if (resumeRef.current) return;

    const resume = () => {
      const audio = audioRef.current;
      if (!audio || muted) return;

      audio.play()
        .then(() => {
          handlePlaybackSuccess();
        })
        .catch(() => {});
    };

    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    resumeRef.current = () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [audioRef, handlePlaybackSuccess, muted]);

  const ensurePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;

    if (muted) {
      audio.pause();
      blockedRef.current = false;
      setIsBlocked(false);
      clearResumeListeners();
      setIsPlaying(false);
      return;
    }

    if (isAudioEffectivelyPlaying(audio)) {
      handlePlaybackSuccess();
      return;
    }

    audio.play()
      .then(() => {
        handlePlaybackSuccess();
      })
      .catch(() => {
        setIsPlaying(false);
        setIsBlocked(true);
        queueResumeOnInteraction();

        if (!blockedRef.current) {
          onBlocked?.();
        }

        blockedRef.current = true;
      });
  }, [audioRef, clearResumeListeners, handlePlaybackSuccess, muted, onBlocked, queueResumeOnInteraction, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;

    if (muted) {
      audio.pause();
      blockedRef.current = false;
      setIsBlocked(false);
      clearResumeListeners();
      setIsPlaying(false);
      return;
    }

    const checkPlayback = () => {
      if (document.hidden) {
        syncPlaybackState();
        return;
      }

      ensurePlayback();
    };

    const sync = () => {
      syncPlaybackState();
    };

    ensurePlayback();

    const intervalId = window.setInterval(checkPlayback, checkerIntervalMs);

    document.addEventListener('visibilitychange', checkPlayback);
    window.addEventListener('pageshow', checkPlayback);
    audio.addEventListener('canplay', checkPlayback);
    audio.addEventListener('canplaythrough', checkPlayback);
    audio.addEventListener('play', sync);
    audio.addEventListener('playing', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('waiting', sync);
    audio.addEventListener('stalled', sync);
    audio.addEventListener('ended', sync);
    audio.addEventListener('emptied', sync);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', checkPlayback);
      window.removeEventListener('pageshow', checkPlayback);
      audio.removeEventListener('canplay', checkPlayback);
      audio.removeEventListener('canplaythrough', checkPlayback);
      audio.removeEventListener('play', sync);
      audio.removeEventListener('playing', sync);
      audio.removeEventListener('pause', sync);
      audio.removeEventListener('waiting', sync);
      audio.removeEventListener('stalled', sync);
      audio.removeEventListener('ended', sync);
      audio.removeEventListener('emptied', sync);
      clearResumeListeners();
    };
  }, [audioRef, checkerIntervalMs, clearResumeListeners, ensurePlayback, muted, syncPlaybackState, volume]);

  return {
    ensurePlayback,
    isBlocked,
    isPlaying,
  };
}
