interface AudioWaveIconProps {
  active: boolean;
}

export default function AudioWaveIcon({ active }: AudioWaveIconProps) {
  return (
    <svg
      width="55%"
      height="55%"
      viewBox="0 0 24 16"
      fill="none"
      className={`audio-wave-icon${active ? ' is-active' : ''}`}
      style={{ position: 'relative' }}
    >
      <line
        className="audio-wave-icon__baseline"
        x1="2"
        y1="8"
        x2="22"
        y2="8"
        stroke="#68142b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g className="audio-wave-icon__motion">
        <path
          className="audio-wave-icon__wave"
          d="M2 8C3.6 8 3.9 4.4 5.6 4.4C7.3 4.4 7.2 11.6 8.9 11.6C10.6 11.6 10.5 5.8 12.2 5.8C13.9 5.8 14 10.2 15.7 10.2C17.4 10.2 17.5 6.2 19.2 6.2C20.9 6.2 20.8 8 22 8"
          stroke="#68142b"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
