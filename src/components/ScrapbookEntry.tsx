import type { CSSProperties } from 'react';
import type { ScrapbookEntry as Entry } from '../lib/supabase';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* Layout the photos based on count. Returns a CSS grid template per image. */
function photoGridStyle(count: number): CSSProperties {
  if (count <= 1) {
    return { display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'center', gap: '24px' };
  }
  if (count === 2) {
    return { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' };
  }
  return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', alignItems: 'start' };
}

function photoSize(count: number, idx: number) {
  if (count === 1) return { width: 'min(420px, 80%)', aspectRatio: '4 / 5' };
  if (count === 2) return { width: '100%', aspectRatio: '3 / 4' };
  // collage: vary aspect for visual rhythm
  const ratios = ['3 / 4', '4 / 5', '1 / 1', '5 / 4'];
  return { width: '100%', aspectRatio: ratios[idx % ratios.length] };
}

interface Props {
  entry: Entry;
  editable?: boolean;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
}

export default function ScrapbookEntry({ entry, editable, onEdit, onDelete }: Props) {
  const { images, caption, created_at, id } = entry;
  const tapeAlt = (parseInt(id.slice(0, 4), 16) % 2) === 0;

  return (
    <article className="scrapbook-entry">
      {/* photos */}
      <div style={photoGridStyle(images.length)}>
        {images.map((img, i) => (
          <div
            key={i}
            className="scrapbook-photo"
            style={{
              transform: `rotate(${img.rotate}deg)`,
              ...photoSize(images.length, i),
            }}
          >
            {i === 0 && (
              <span className={`scrapbook-tape${tapeAlt ? ' scrapbook-tape--alt' : ''}`} />
            )}
            <img src={img.url} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {/* caption */}
      {caption.trim() && (
        <p className="scrapbook-caption" style={{ marginTop: '36px' }}>
          {caption}
        </p>
      )}

      {/* date */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '20px',
      }}>
        <span className="scrapbook-date">— {formatDate(created_at)}</span>
        {editable && (
          <span style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onEdit?.(entry)}
              style={{
                fontFamily: "'Caveat', cursive", fontSize: '15px',
                color: 'rgba(50, 96, 85, 0.6)', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0,
              }}
            >
              edit
            </button>
            <button
              onClick={() => onDelete?.(entry)}
              style={{
                fontFamily: "'Caveat', cursive", fontSize: '15px',
                color: 'rgba(192, 72, 90, 0.7)', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0,
              }}
            >
              delete
            </button>
          </span>
        )}
      </div>
    </article>
  );
}
