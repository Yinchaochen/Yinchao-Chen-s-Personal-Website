import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createWriting,
  deleteWriting,
  hasSession,
  listWritings,
  updateWriting,
  type Writing,
} from '../lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/* Short synthesized paper rustle for page turns (respects the site mute). */
let pageAudioCtx: AudioContext | undefined;
function playPageSound() {
  try {
    if (window.localStorage.getItem('site-audio-muted') === 'true') return;
    pageAudioCtx ??= new AudioContext();
    const ctx = pageAudioCtx;
    const dur = 0.3;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) ** 2 * (0.35 + 0.65 * Math.sin(t * Math.PI));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start();
  } catch { /* audio is a nicety, never an error */ }
}

/* Hand-drawn doodles on the left page, cycling per entry — a nod to Sean's
   sketches. Each uses doubled offset strokes and hatching, and the shared
   turbulence filter (defined in the page) wobbles them like graphite. */
const DOODLES = [
  /* howling wolf */
  <svg key="wolf" viewBox="0 0 120 80" className="journal-doodle-svg">
    <g opacity="0.75">
      <path d="M18 66 Q24 58 26 48 Q27 40 33 36 Q30 28 34 20 L42 30 Q50 26 58 29 L68 18 Q72 28 68 35 Q78 44 74 56 Q70 66 58 68 Q40 72 18 66 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g opacity="0.3" transform="translate(0.9 -0.6)">
      <path d="M18 66 Q24 58 26 48 Q27 40 33 36 M34 20 L42 30 Q50 26 58 29 M68 35 Q78 44 74 56" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </g>
    <circle cx="52" cy="38" r="1.4" fill="currentColor" />
    <path d="M80 24 Q86 18 88 12 M86 28 Q94 24 98 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <path d="M62 58 l5 -6 M66 60 l5 -6 M70 61 l4 -5 M58 64 l4 -5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" strokeLinecap="round" />
  </svg>,
  /* mountains and sun */
  <svg key="mountains" viewBox="0 0 120 80" className="journal-doodle-svg">
    <g opacity="0.75">
      <path d="M8 64 L36 28 L50 46 L64 22 L98 64 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g opacity="0.32" transform="translate(-0.7 0.8)">
      <path d="M8 64 L36 28 L50 46 M64 22 L98 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </g>
    <path d="M30 36 L36 30 L41 37" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
    <circle cx="96" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
    <path d="M96 6 L96 2 M108 18 L112 18 M105 9 L108 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M70 40 l6 9 M75 38 l7 10 M80 42 l6 9 M85 46 l6 9 M90 52 l5 8" stroke="currentColor" strokeWidth="0.9" opacity="0.28" strokeLinecap="round" />
    <path d="M22 52 l5 7 M27 48 l5 8 M17 58 l4 5" stroke="currentColor" strokeWidth="0.9" opacity="0.25" strokeLinecap="round" />
  </svg>,
  /* moon and stars */
  <svg key="moon" viewBox="0 0 120 80" className="journal-doodle-svg">
    <g opacity="0.75">
      <path d="M64 12 Q50 18 50 36 Q50 54 64 60 Q46 62 36 48 Q28 36 36 24 Q44 12 64 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </g>
    <g opacity="0.3" transform="translate(0.8 0.5)">
      <path d="M64 12 Q50 18 50 36 Q50 54 64 60" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </g>
    <path d="M40 28 q-3 5 -2 11 M42 48 q3 5 9 7" stroke="currentColor" strokeWidth="0.9" opacity="0.3" fill="none" strokeLinecap="round" />
    <path d="M84 22 L86 28 L92 30 L86 32 L84 38 L82 32 L76 30 L82 28 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7" />
    <path d="M98 48 L99 51 L102 52 L99 53 L98 56 L97 53 L94 52 L97 51 Z" fill="currentColor" opacity="0.7" />
  </svg>,
  /* paper plane */
  <svg key="plane" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M14 46 L102 18 L66 64 L56 46 Z M56 46 L102 18 M56 46 L52 62 L60 52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 60 Q30 58 36 62 M10 68 Q24 64 34 68" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" />
  </svg>,
  /* campfire */
  <svg key="campfire" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M60 14 Q52 26 58 34 Q50 32 48 24 Q40 36 48 48 Q54 56 64 54 Q76 50 74 38 Q72 28 64 20 Q66 28 62 32 Q58 26 60 14 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M34 62 L86 56 M38 56 L82 64" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>,
  /* pine forest */
  <svg key="pines" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M30 64 L30 56 M22 58 L30 40 L38 58 Z M20 50 L30 30 L40 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M62 66 L62 54 M50 58 L62 32 L74 58 Z M52 46 L62 24 L72 46" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M92 64 L92 58 M86 60 L92 46 L98 60 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M14 70 Q60 66 106 70" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" strokeLinecap="round" fill="none" />
  </svg>,
  /* train tracks to the horizon */
  <svg key="tracks" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M44 70 L58 12 M76 70 L62 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M42 62 L78 62 M46 50 L74 50 M50 38 L70 38 M54 27 L67 27 M57 18 L64 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="94" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>,
  /* tent under stars */
  <svg key="tent" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M20 64 L54 20 L88 64 Z M54 20 L54 64 M46 64 L54 44 L62 64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M98 26 L99 30 L103 31 L99 32 L98 36 L97 32 L93 31 L97 30 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <path d="M104 12 L105 14 L107 15 L105 16 L104 18 L103 16 L101 15 L103 14 Z" fill="currentColor" />
  </svg>,
  /* compass */
  <svg key="compass" viewBox="0 0 120 80" className="journal-doodle-svg">
    <circle cx="58" cy="40" r="24" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="58" cy="40" r="19" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 4" />
    <path d="M58 40 L68 26 M58 40 L50 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M58 19 L58 15 M58 65 L58 61 M37 40 L33 40 M83 40 L79 40" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M90 58 Q96 54 98 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>,
  /* feather */
  <svg key="feather" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M30 66 Q58 48 78 28 Q88 18 92 12 Q90 26 80 38 Q64 58 36 70 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M38 62 Q60 48 84 20 M46 58 L40 50 M54 52 L48 42 M62 46 L56 36 M70 38 L65 29" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M26 70 Q22 74 16 76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>,
  /* winding road */
  <svg key="road" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M18 70 Q40 62 36 50 Q32 38 56 34 Q80 30 74 20 Q71 14 80 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 70 Q50 64 46 50 Q43 40 64 36 Q88 32 82 18 Q80 13 88 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 64 L32 63 M40 52 L44 51 M58 38 L62 37 M74 24 L78 23" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>,
];

export default function Journal() {
  const [entries, setEntries] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Writing | null>(null);
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null);
  const [session] = useState(hasSession);

  useEffect(() => {
    listWritings()
      .then((rows) => {
        setEntries(rows);
        setIndex(Math.max(0, rows.length - 1)); // open on the latest page
        setLoading(false);
      })
      .catch(() => { setFailed(true); setLoading(false); });
  }, []);

  const goTo = useCallback((target: number, from: number) => {
    const clamped = Math.min(Math.max(target, 0), Math.max(entries.length - 1, 0));
    if (clamped === from) return;
    setIndex(clamped);
    setFlip(clamped > from ? 'next' : 'prev');
    playPageSound();
  }, [entries.length]);

  const turn = useCallback((delta: number) => {
    goTo(index + delta, index);
  }, [goTo, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (composing || editing) return;
      if (e.key === 'ArrowLeft') turn(-1);
      if (e.key === 'ArrowRight') turn(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn, composing, editing]);

  const handleSaved = (saved: Writing, isNew: boolean) => {
    setEntries((prev) => {
      const next = isNew ? [...prev, saved] : prev.map((w) => (w.id === saved.id ? saved : w));
      setIndex(next.findIndex((w) => w.id === saved.id));
      return next;
    });
    setComposing(false);
    setEditing(null);
  };

  const handleDelete = async (entry: Writing) => {
    if (!confirm('Tear out this page?')) return;
    try {
      await deleteWriting(entry.id);
    } catch (error) {
      alert('Delete failed: ' + (error instanceof Error ? error.message : error));
      return;
    }
    setEntries((prev) => {
      const next = prev.filter((w) => w.id !== entry.id);
      setIndex((i) => Math.min(i, Math.max(next.length - 1, 0)));
      return next;
    });
  };

  const current = entries[index];

  return (
    <div className="journal-desk">
      <nav className="journal-nav">
        <Link to="/" className="journal-back">← Portfolio</Link>
      </nav>

      <div className="journal-book-wrap">
        {/* index tabs, like the game's journal tabs */}
        {entries.length > 0 && (
          <div className="journal-tabs">
            {entries.map((w, i) => (
              <button
                key={w.id}
                className={`journal-tab${i === index ? ' is-active' : ''}`}
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                onClick={() => goTo(i, index)}
                title={w.title}
              >
                {w.title.length > 14 ? w.title.slice(0, 13) + '…' : w.title}
              </button>
            ))}
          </div>
        )}

        <div className="journal-book">
          <span className="journal-heading">Field Notes</span>
          <div className="journal-elastic" aria-hidden />
          {loading && (
            <div className="journal-spread">
              <div className="journal-page journal-page--left"><p className="journal-muted">…</p></div>
              <div className="journal-page journal-page--right" />
            </div>
          )}

          {!loading && failed && (
            <div className="journal-spread">
              <div className="journal-page journal-page--left">
                <p className="journal-muted">Couldn't open the journal. Check your connection and refresh.</p>
              </div>
              <div className="journal-page journal-page--right" />
            </div>
          )}

          {!loading && !failed && !current && (
            <div className="journal-spread">
              <div className="journal-page journal-page--left">
                <p className="journal-muted">Nothing written yet.</p>
              </div>
              <div className="journal-page journal-page--right">
                {session && <p className="journal-muted">Press ✎ to write the first page.</p>}
              </div>
            </div>
          )}

          {!loading && !failed && current && (
            <div className="journal-spread" key={current.id}>
              <div className="journal-page journal-page--left">
                <span className="journal-date-tag">{formatDate(current.published_at)}</span>
                <h1 className="journal-title">
                  {current.title}
                  <svg className="journal-underline" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 5 Q50 2 100 5 T198 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </h1>
                <div className="journal-doodle" aria-hidden>
                  {DOODLES[index % DOODLES.length]}
                </div>
                {session && (
                  <span className="journal-admin">
                    <button onClick={() => setEditing(current)}>edit</button>
                    <button onClick={() => handleDelete(current)}>tear out</button>
                  </span>
                )}
              </div>
              <div className="journal-page journal-page--right">
                <div className="journal-body">{current.body}</div>
              </div>
            </div>
          )}

          {/* the turning sheet — a 3D page flip around the spine */}
          {flip && (
            <div
              className={`journal-sheet journal-sheet--${flip}`}
              onAnimationEnd={() => setFlip(null)}
              aria-hidden
            />
          )}

          {/* page counter with turn arrows, like the game's 47/106 ◁▷ */}
          {entries.length > 0 && (
            <span className="journal-pageno">
              <button className="journal-corner" onClick={() => turn(-1)} disabled={index === 0} aria-label="Previous page">◀</button>
              {index + 1}/{entries.length}
              <button className="journal-corner" onClick={() => turn(1)} disabled={index >= entries.length - 1} aria-label="Next page">▶</button>
            </span>
          )}
        </div>
      </div>

      {session && !composing && !editing && (
        <button className="journal-fab" onClick={() => setComposing(true)} title="Write a new page">✎</button>
      )}

      {(composing || editing) && (
        <ComposeDrawer
          existing={editing}
          onClose={() => { setComposing(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

/* ── Compose / Edit drawer ────────────────────────────── */
function ComposeDrawer({ existing, onClose, onSaved }: {
  existing: Writing | null;
  onClose: () => void;
  onSaved: (saved: Writing, isNew: boolean) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !body.trim()) { alert('A page needs a title and some words.'); return; }
    setSaving(true);
    try {
      const saved = existing
        ? await updateWriting(existing.id, { title, body })
        : await createWriting({ title, body });
      setSaving(false);
      onSaved(saved, !existing);
    } catch (error) {
      setSaving(false);
      alert('Save failed: ' + (error instanceof Error ? error.message : error));
    }
  };

  return (
    <div className="journal-drawer-backdrop">
      <div className="journal-drawer">
        <input
          className="journal-drawer-title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          spellCheck={false}
        />
        <textarea
          className="journal-drawer-body"
          placeholder={'Write your poem or prose…\n\nLine breaks are kept exactly as you type them.'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          spellCheck={false}
        />
        <div className="journal-drawer-actions">
          <button className="journal-drawer-cancel" onClick={onClose}>Cancel</button>
          <button className="journal-drawer-save" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : existing ? 'Save changes' : 'Add page'}
          </button>
        </div>
      </div>
    </div>
  );
}
