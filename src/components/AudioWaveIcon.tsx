import { useEffect, useMemo, useRef, useState } from 'react';

interface AudioWaveIconProps {
  active: boolean;
}

const START_X = 2;
const END_X = 22;
const BASE_Y = 8;
const POINT_COUNT = 19;

function buildWavePath(phase: number, intensity: number) {
  const step = (END_X - START_X) / (POINT_COUNT - 1);
  const amplitude = 3.1 * intensity * (0.84 + 0.16 * Math.sin(phase * 0.55));

  const points = Array.from({ length: POINT_COUNT }, (_, index) => {
    const x = START_X + step * index;
    const progress = index / (POINT_COUNT - 1);
    const envelope = Math.sin(Math.PI * progress) ** 1.15;
    const ripple =
      Math.sin(progress * Math.PI * 2.8 - phase) +
      0.42 * Math.sin(progress * Math.PI * 5.6 + phase * 1.35);
    const drift = 0.16 * Math.sin(phase * 0.4 + progress * Math.PI * 1.2);
    const y = BASE_Y - amplitude * envelope * (ripple * 0.78 + drift);

    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return points.join(' ');
}

export default function AudioWaveIcon({ active }: AudioWaveIconProps) {
  const [frame, setFrame] = useState({ phase: 0, intensity: 0 });
  const frameRef = useRef(frame);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = 0;

    const tick = (now: number) => {
      const previous = frameRef.current;
      const delta = lastTime ? Math.min(42, now - lastTime) : 16;
      lastTime = now;

      const targetIntensity = active ? 1 : 0;
      const smoothing = 1 - Math.exp(-delta / (active ? 180 : 140));
      const intensity = previous.intensity + (targetIntensity - previous.intensity) * smoothing;
      const phase = active || intensity > 0.015 ? previous.phase + delta * 0.0085 : 0;
      const next = { phase, intensity };

      frameRef.current = next;
      setFrame(next);

      if (active || intensity > 0.015) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [active]);

  const path = useMemo(
    () => buildWavePath(frame.phase, frame.intensity),
    [frame.phase, frame.intensity],
  );

  return (
    <svg
      width="55%"
      height="55%"
      viewBox="0 0 24 16"
      fill="none"
      className={`audio-wave-icon${frame.intensity > 0.08 ? ' is-active' : ''}`}
      style={{ position: 'relative' }}
      aria-hidden
    >
      <path
        className="audio-wave-icon__wave"
        d={path}
        stroke="#68142b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
