interface AudioHintBubbleProps {
  visible: boolean;
  text: string;
  top?: string;
  bottom?: string;
  right?: string;
}

export default function AudioHintBubble({
  visible,
  text,
  top,
  bottom,
  right = 'calc(100% + 12px)',
}: AudioHintBubbleProps) {
  const positionClass = top ? 'audio-hint-bubble--centered' : 'audio-hint-bubble--bottom';

  return (
    <div
      aria-hidden
      className={`audio-hint-bubble ${positionClass}${visible ? ' is-visible' : ''}`}
      style={{
        position: 'absolute',
        top,
        bottom,
        right,
      }}
    >
      <span className="audio-hint-bubble__text">{text}</span>
    </div>
  );
}
