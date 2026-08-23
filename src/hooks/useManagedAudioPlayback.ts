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
  return !audio.paused && !audio.ended && !audio.muted;
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
  const playAttemptRef = useRef(0);
  const mutedRef = useRef(muted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const clearResumeListeners = useCallback(() => {
    resumeRef.current?.();
    resumeRef.current = null;
  }, []);

  const syncPlaybackState = useCallback(() => {
    const audio = audioRef.current;
    setIsPlaying(Boolean(audio && isAudioEffectivelyPlaying(audio)));
  }, [audioRef]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;

    playAttemptRef.current += 1;
    blockedRef.current = false;
    setIsBlocked(false);
    clearResumeListeners();
    setIsPlaying(false);

    if (!audio) return;

    audio.pause();
    audio.muted = true;
  }, [audioRef, clearResumeListeners]);

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
      if (!audio || mutedRef.current) return;

      const attemptId = ++playAttemptRef.current;

      audio.play()
        .then(() => {
          if (attemptId !== playAttemptRef.current || mutedRef.current) {
            audio.pause();
            return;
          }
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
  }, [audioRef, handlePlaybackSuccess]);

  const ensurePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;

    if (muted) {
      stopPlayback();
      return;
    }

    if (isAudioEffectivelyPlaying(audio)) {
      handlePlaybackSuccess();
      return;
    }

    const attemptId = ++playAttemptRef.current;

    audio.play()
      .then(() => {
        if (attemptId !== playAttemptRef.current || mutedRef.current) {
          audio.pause();
          return;
        }
        handlePlaybackSuccess();
      })
      .catch(() => {
        if (attemptId !== playAttemptRef.current || mutedRef.current) {
          return;
        }
        setIsPlaying(false);
        setIsBlocked(true);
        queueResumeOnInteraction();

        if (!blockedRef.current) {
          onBlocked?.();
        }

        blockedRef.current = true;
      });
  }, [audioRef, handlePlaybackSuccess, muted, onBlocked, queueResumeOnInteraction, stopPlayback, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;

    if (muted) {
      stopPlayback();
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
    audio.addEventListener('loadeddata', sync);
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('playing', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', checkPlayback);
      window.removeEventListener('pageshow', checkPlayback);
      audio.removeEventListener('canplay', checkPlayback);
      audio.removeEventListener('canplaythrough', checkPlayback);
      audio.removeEventListener('loadeddata', sync);
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('play', sync);
      audio.removeEventListener('playing', sync);
      audio.removeEventListener('pause', sync);
      audio.removeEventListener('ended', sync);
      clearResumeListeners();
    };
  }, [audioRef, checkerIntervalMs, clearResumeListeners, ensurePlayback, muted, stopPlayback, syncPlaybackState, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      if (!audio) return;

      playAttemptRef.current += 1;
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioRef]);

  return {
    ensurePlayback,
    isBlocked,
    isPlaying,
    stopPlayback,
  };
}
