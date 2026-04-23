import { useEffect, useRef, useState } from 'react';

interface UseAudioHintBubbleOptions {
  enabled: boolean;
  hintKey: string;
  durationMs?: number;
}

export function useAudioHintBubble({
  enabled,
  hintKey,
  durationMs = 3000,
}: UseAudioHintBubbleOptions) {
  const seenKeysRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    if (seenKeysRef.current.has(hintKey)) return;

    seenKeysRef.current.add(hintKey);
    setVisible(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, durationMs);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [durationMs, enabled, hintKey]);

  return visible;
}
