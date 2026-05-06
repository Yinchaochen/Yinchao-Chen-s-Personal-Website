import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase, type ScrapbookEntry as Entry, type ScrapbookImage } from '../lib/supabase';
import ScrapbookEntry from '../components/ScrapbookEntry';

const PAGE_SIZE = 8;

function randomRotate() {
  return Math.round((Math.random() * 6 - 3) * 10) / 10; // -3..+3 deg
}

export default function Photography() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [composing, setComposing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  /* auth */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  /* fetch */
  const fetchPage = useCallback(async (offset: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const { data, error } = await supabase
      .from('scrapbook_entries')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    loadingRef.current = false;
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Entry[];
    setEntries(prev => offset === 0 ? rows : [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  /* infinite scroll */
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !loadingRef.current) fetchPage(entries.length);
    }, { rootMargin: '400px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [entries.length, hasMore, fetchPage]);

  const handleSaved = (saved: Entry, isNew: boolean) => {
    setEntries(prev => isNew ? [saved, ...prev] : prev.map(e => e.id === saved.id ? saved : e));
    setComposing(false);
    setEditingEntry(null);
  };

  const handleDelete = async (entry: Entry) => {
    if (!confirm('Delete this page?')) return;
    const { error } = await supabase
      .from('scrapbook_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entry.id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  return (
    <div
      className="scrapbook-paper"
      style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}
    >
      {/* top-left back link */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(246,239,222,0.95), rgba(246,239,222,0))',
        backdropFilter: 'blur(2px)',
      }}>
        <Link to="/" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#326055',
          letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8,
        }}>
          ← Portfolio
        </Link>
        <span className="handwriting" style={{
          fontSize: '26px', color: '#326055', fontWeight: 700,
        }}>
          Through the Lens
        </span>
        <span style={{ width: '80px' }} />
      </nav>

      {/* entries */}
      <main style={{ position: 'relative', paddingBottom: '120px', minHeight: 'calc(100vh - 80px)' }}>
        {loading && entries.length === 0 && (
          <p style={{
            textAlign: 'center', marginTop: '120px',
            fontFamily: "'Caveat', cursive", fontSize: '22px', color: 'rgba(50, 96, 85, 0.5)',
          }}>
            Turning the pages...
          </p>
        )}

        {!loading && entries.length === 0 && (
          <p style={{
            textAlign: 'center', marginTop: '160px',
            fontFamily: "'Caveat', cursive", fontSize: '24px', color: 'rgba(50, 96, 85, 0.45)',
          }}>
            A blank journal, waiting for its first page.
          </p>
        )}

        {entries.map(entry => (
          <ScrapbookEntry
            key={entry.id}
            entry={entry}
            editable={!!session}
            onEdit={() => setEditingEntry(entry)}
            onDelete={handleDelete}
          />
        ))}

        {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      </main>

      {/* FAB to add a new page (logged in only) */}
      {session && !composing && !editingEntry && (
        <button
          className="scrapbook-fab"
          onClick={() => setComposing(true)}
          title="Add a new page"
        >
          +
        </button>
      )}

      {/* compose drawer */}
      {(composing || editingEntry) && (
        <ComposeDrawer
          existing={editingEntry}
          onClose={() => { setComposing(false); setEditingEntry(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

/* ── Compose / Edit drawer ────────────────────────────── */
interface ComposeProps {
  existing: Entry | null;
  onClose: () => void;
  onSaved: (entry: Entry, isNew: boolean) => void;
}

function ComposeDrawer({ existing, onClose, onSaved }: ComposeProps) {
  const [caption, setCaption] = useState(existing?.caption ?? '');
  const [images, setImages] = useState<ScrapbookImage[]>(existing?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | File[]) => {
    setUploading(true);
    const next: ScrapbookImage[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const safe = file.name.replace(/\.[^.]+$/, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
      const path = `scrapbook/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}.${ext}`;
      const { data, error } = await supabase.storage.from('article-images').upload(path, file);
      if (error) {
        alert(`Upload failed: ${error.message}`);
        setUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
      next.push({ url: publicUrl, rotate: randomRotate() });
    }
    setImages(prev => [...prev, ...next]);
    setUploading(false);
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const save = async () => {
    if (images.length === 0) { alert('Add at least one photo.'); return; }
    setSaving(true);
    const payload = { caption, images };
    if (existing) {
      const { data, error } = await supabase
        .from('scrapbook_entries')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      setSaving(false);
      if (error) { alert('Save failed: ' + error.message); return; }
      onSaved(data as Entry, false);
    } else {
      const { data, error } = await supabase
        .from('scrapbook_entries')
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error) { alert('Save failed: ' + error.message); return; }
      onSaved(data as Entry, true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(44, 46, 44, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '560px', maxHeight: '90vh',
        background: '#fdfbf4', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(44, 46, 44, 0.3)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 28px', borderBottom: '1px solid rgba(50, 96, 85, 0.15)',
        }}>
          <span className="handwriting" style={{ fontSize: '24px', color: '#326055', fontWeight: 700 }}>
            {existing ? 'Edit page' : 'A new page'}
          </span>
          <button onClick={onClose} style={{
            fontFamily: "'Caveat', cursive", fontSize: '18px',
            color: 'rgba(50, 96, 85, 0.6)', cursor: 'pointer', background: 'none', border: 'none',
          }}>
            close ×
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <input
            ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={e => { const f = e.target.files; if (f?.length) upload(f); e.target.value = ''; }}
          />

          {/* image previews */}
          {images.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
              marginBottom: '20px',
            }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                  <img src={img.url} alt="" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                  <button
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: 'rgba(44, 46, 44, 0.7)', color: '#f6efde',
                      fontSize: '14px', lineHeight: 1, cursor: 'pointer',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'block', width: '100%', padding: '14px',
              border: '1.5px dashed rgba(50, 96, 85, 0.5)',
              fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#326055',
              background: 'rgba(50, 96, 85, 0.04)', cursor: 'pointer',
              opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'Pasting in...' : '+ add photos'}
          </button>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Write something..."
            rows={5}
            style={{
              display: 'block', width: '100%', marginTop: '20px', padding: '12px',
              fontFamily: "'Caveat', 'Ma Shan Zheng', cursive", fontSize: '20px',
              lineHeight: 1.5, color: '#2c2e2c',
              background: 'transparent',
              border: '1px solid rgba(50, 96, 85, 0.2)',
              outline: 'none', resize: 'vertical',
            }}
          />

          <button
            onClick={save}
            disabled={saving || uploading}
            style={{
              display: 'block', width: '100%', marginTop: '20px', padding: '12px',
              background: '#326055', color: '#f6efde',
              fontFamily: 'Inter, sans-serif', fontSize: '13px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer',
              opacity: (saving || uploading) ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : existing ? 'Update' : 'Pin to journal'}
          </button>
        </div>
      </div>
    </div>
  );
}
