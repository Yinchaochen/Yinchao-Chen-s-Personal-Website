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
import { DOODLES, MARGINALIA } from '../components/JournalDoodles';

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
      {/* taped paper cards, like the game's top strip of belongings */}
      <nav className="journal-nav">
        <Link to="/" className="journal-card" style={{ transform: 'rotate(-2deg)' }}>Home</Link>
        <Link to="/blog" className="journal-card" style={{ transform: 'rotate(1.4deg)' }}>Blog</Link>
        <Link to="/photography" className="journal-card" style={{ transform: 'rotate(-1deg)' }}>Photos</Link>
      </nav>

      <div className="journal-book-wrap">
        {/* bookmark panel, like the game's SEGNALIBRI column */}
        {entries.length > 0 && (
          <div className="journal-tabs">
            <div className="journal-tabs-clip" aria-hidden />
            <div className="journal-tabs-header">Pages</div>
            {entries.map((w, i) => (
              <button
                key={w.id}
                className={`journal-tab${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i, index)}
                title={w.title}
              >
                {w.title.length > 16 ? w.title.slice(0, 15) + '…' : w.title}
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
                <div className="journal-margin journal-margin--a" aria-hidden>
                  {MARGINALIA[index % MARGINALIA.length]}
                </div>
                <div className="journal-margin journal-margin--b" aria-hidden>
                  {MARGINALIA[(index + 2) % MARGINALIA.length]}
                </div>
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

          {/* page counter on a paper scrap with hand-drawn arrows, like 2/106 ◁▷ */}
          {entries.length > 0 && (
            <span className="journal-pageno">
              <button className="journal-corner" onClick={() => turn(-1)} disabled={index === 0} aria-label="Previous page">
                <svg viewBox="0 0 20 20" width="17" height="17"><path d="M14 3 L5 10 L14 17 L12 10 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" /></svg>
              </button>
              <span className="journal-pageno-num">{index + 1}/{entries.length}</span>
              <button className="journal-corner" onClick={() => turn(1)} disabled={index >= entries.length - 1} aria-label="Next page">
                <svg viewBox="0 0 20 20" width="17" height="17"><path d="M6 3 L15 10 L6 17 L8 10 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" /></svg>
              </button>
            </span>
          )}
        </div>

        {/* control hint, like the game's bottom-right prompts */}
        <p className="journal-hint">← → turn the page</p>
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
