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

/* Hand-drawn doodles in the corner of the left page, cycling per entry —
   a nod to Sean's sketches. */
const DOODLES = [
  /* howling wolf */
  <svg key="wolf" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M18 66 Q24 58 26 48 Q27 40 33 36 Q30 28 34 20 L42 30 Q50 26 58 29 L68 18 Q72 28 68 35 Q78 44 74 56 Q70 66 58 68 Q40 72 18 66 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="52" cy="38" r="1.4" fill="currentColor" />
    <path d="M80 24 Q86 18 88 12 M86 28 Q94 24 98 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>,
  /* mountains and sun */
  <svg key="mountains" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M8 64 L36 28 L50 46 L64 22 L98 64 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 36 L36 30 L41 37" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="96" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M96 6 L96 2 M108 18 L112 18 M105 9 L108 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>,
  /* moon and stars */
  <svg key="moon" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M64 12 Q50 18 50 36 Q50 54 64 60 Q46 62 36 48 Q28 36 36 24 Q44 12 64 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M84 22 L86 28 L92 30 L86 32 L84 38 L82 32 L76 30 L82 28 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M98 48 L99 51 L102 52 L99 53 L98 56 L97 53 L94 52 L97 51 Z" fill="currentColor" />
  </svg>,
  /* paper plane */
  <svg key="plane" viewBox="0 0 120 80" className="journal-doodle-svg">
    <path d="M14 46 L102 18 L66 64 L56 46 Z M56 46 L102 18 M56 46 L52 62 L60 52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 60 Q30 58 36 62 M10 68 Q24 64 34 68" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" />
  </svg>,
];

export default function Journal() {
  const [entries, setEntries] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Writing | null>(null);
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

  const turn = useCallback((delta: number) => {
    setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(entries.length - 1, 0)));
  }, [entries.length]);

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
        <span className="journal-heading">Field Notes</span>
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
                onClick={() => setIndex(i)}
                title={w.title}
              >
                {w.title.length > 14 ? w.title.slice(0, 13) + '…' : w.title}
              </button>
            ))}
          </div>
        )}

        <div className="journal-book">
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
                <span className="journal-pageno">pg. {index + 1} / {entries.length}</span>
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

          {/* page-turn corners */}
          {index > 0 && (
            <button className="journal-corner journal-corner--prev" onClick={() => turn(-1)} aria-label="Previous page">←</button>
          )}
          {index < entries.length - 1 && (
            <button className="journal-corner journal-corner--next" onClick={() => turn(1)} aria-label="Next page">→</button>
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
