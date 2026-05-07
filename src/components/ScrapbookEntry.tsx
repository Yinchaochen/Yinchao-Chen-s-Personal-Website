import { useEffect, useState, type CSSProperties } from 'react';
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

function navBtnStyle(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)',
    [side]: '24px',
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)', color: '#f6efde',
    border: 'none', cursor: 'pointer', fontSize: '28px', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
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
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      else if (e.key === 'ArrowLeft') setLightboxIdx(i => (i === null ? null : (i - 1 + images.length) % images.length));
      else if (e.key === 'ArrowRight') setLightboxIdx(i => (i === null ? null : (i + 1) % images.length));
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, images.length]);

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
              cursor: 'zoom-in',
              ...photoSize(images.length, i),
            }}
            onClick={() => setLightboxIdx(i)}
          >
            {i === 0 && (
              <span className={`scrapbook-tape${tapeAlt ? ' scrapbook-tape--alt' : ''}`} />
            )}
            <img src={img.thumb_url ?? img.url} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>

      {/* lightbox */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(20, 20, 20, 0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '40px',
          }}
        >
          <img
            src={images[lightboxIdx].url}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />

          {/* close */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(null); }}
            aria-label="Close"
            style={{
              position: 'fixed', top: '24px', right: '24px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', color: '#f6efde',
              border: 'none', cursor: 'pointer', fontSize: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {/* prev / next */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i === null ? null : (i - 1 + images.length) % images.length); }}
                aria-label="Previous"
                style={navBtnStyle('left')}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i === null ? null : (i + 1) % images.length); }}
                aria-label="Next"
                style={navBtnStyle('right')}
              >›</button>
              <span style={{
                position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                fontFamily: "'Caveat', cursive", fontSize: '18px',
                color: 'rgba(246, 239, 222, 0.6)',
              }}>
                {lightboxIdx + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}

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
