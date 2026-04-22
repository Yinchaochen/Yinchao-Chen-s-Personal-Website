import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

/* ── Auth gate ────────────────────────────────────────── */
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else onLogin();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#faf9f7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
        <h1 style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '28px', fontStyle: 'italic', fontWeight: 700,
          color: '#68142b', marginBottom: '36px', textAlign: 'center',
        }}>
          Sign In
        </h1>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required
          style={{ ...inputStyle, marginTop: '12px' }}
        />
        {error && <p style={{ fontSize: '13px', color: '#c0485a', marginTop: '10px' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          display: 'block', width: '100%', marginTop: '24px',
          padding: '12px', background: '#68142b', color: '#faf9f7',
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
          border: 'none',
        }}>
          {loading ? 'Signing in…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 0',
  borderBottom: '1px solid rgba(44,46,44,0.25)',
  fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#2c2e2c',
  background: 'transparent', outline: 'none',
};

/* ── Toolbar ──────────────────────────────────────────── */
function Toolbar({ editor, onImageUpload }: {
  editor: ReturnType<typeof useEditor>;
  onImageUpload: () => void;
}) {
  if (!editor) return null;
  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        padding: '5px 8px', border: 'none', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: '12px',
        background: active ? 'rgba(104,20,43,0.12)' : 'transparent',
        color: active ? '#68142b' : '#2c2e2c',
        opacity: active ? 1 : 0.6, borderRadius: '3px',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
      padding: '8px 16px',
      borderBottom: '1px solid rgba(44,46,44,0.1)',
      background: '#faf9f7',
      position: 'sticky', top: '61px', zIndex: 9,
    }}>
      {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
      <span style={{ width: '1px', height: '18px', background: 'rgba(44,46,44,0.15)', margin: '0 4px' }} />
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      <span style={{ width: '1px', height: '18px', background: 'rgba(44,46,44,0.15)', margin: '0 4px' }} />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), '" Quote')}
      {btn(false, () => editor.chain().focus().setHorizontalRule().run(), '— Rule')}
      <span style={{ width: '1px', height: '18px', background: 'rgba(44,46,44,0.15)', margin: '0 4px' }} />
      {btn(false, onImageUpload, '↑ Image')}
    </div>
  );
}

/* ── Main editor ──────────────────────────────────────── */
export default function Write() {
  const { id: articleId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInsertPosRef = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    editorProps: {
      attributes: {
        class: 'write-editor',
        style: 'outline: none; min-height: 60vh;',
      },
    },
  });

  /* Auth check */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  /* Load existing article for editing */
  useEffect(() => {
    if (!articleId || !editor) return;
    supabase.from('articles').select('*').eq('id', articleId).single().then(({ data }) => {
      if (!data) return;
      setTitle(data.title);
      setExistingSlug(data.slug);
      editor.commands.setContent(data.content);
    });
  }, [articleId, editor]);

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    if (!editor) return;
    let insertPos = imageInsertPosRef.current ?? editor.state.selection.to;

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'image';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;
      const { data, error } = await supabase.storage.from('article-images').upload(path, file);
      if (error) {
        alert(`Image upload failed for "${file.name}": ${error.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path);
      editor.chain().focus().insertContentAt(insertPos, [
        { type: 'image', attrs: { src: publicUrl } },
        { type: 'paragraph' },
      ]).run();
      insertPos = editor.state.selection.to;
      imageInsertPosRef.current = insertPos;
    }
  }, [editor]);

  const openImagePicker = useCallback(() => {
    if (editor) imageInsertPosRef.current = editor.state.selection.to;
    fileInputRef.current?.click();
  }, [editor]);

  const save = async () => {
    if (!editor || !title.trim()) { alert('Please add a title.'); return; }
    setSaving(true);
    const content = editor.getHTML();
    const now = new Date().toISOString();

    if (articleId && existingSlug) {
      /* Update */
      const { error } = await supabase.from('articles').update({ title, content, updated_at: now }).eq('id', articleId);
      if (error) alert('Save failed: ' + error.message);
    } else {
      /* Insert */
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const { data, error } = await supabase.from('articles').insert({ slug, title, content, published_at: now, updated_at: now }).select().single();
      if (error) { alert('Save failed: ' + error.message); setSaving(false); return; }
      navigate(`/write/${data.id}`, { replace: true });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!articleId || !confirm('Delete this post?')) return;
    await supabase.from('articles').delete().eq('id', articleId);
    navigate('/blog');
  };

  /* Loading auth */
  if (session === undefined) return null;
  if (!session) return <LoginForm onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#faf9f7' }}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { const files = e.target.files; if (files?.length) handleImageUpload(files); e.target.value = ''; }}
      />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        background: '#faf9f7',
        borderBottom: '1px solid rgba(44,46,44,0.1)',
      }}>
        <Link to="/blog" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#68142b',
          letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7,
        }}>
          ← Writing
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {articleId && (
            <button onClick={handleDelete} style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#c0485a', opacity: 0.7, cursor: 'pointer',
              background: 'none', border: 'none',
            }}>
              Delete
            </button>
          )}
          {articleId && (
            <Link to={`/blog/${existingSlug}`} target="_blank" style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#2c2e2c', opacity: 0.5,
            }}>
              View ↗
            </Link>
          )}
          <button onClick={save} disabled={saving} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#faf9f7', background: saved ? '#326055' : '#68142b',
            padding: '8px 20px', cursor: 'pointer', border: 'none',
            opacity: saving ? 0.6 : 1, transition: 'background 0.3s',
          }}>
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Publish'}
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            color: '#2c2e2c', opacity: 0.35, cursor: 'pointer',
            background: 'none', border: 'none',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Toolbar */}
      <Toolbar editor={editor} onImageUpload={openImagePicker} />

      {/* Editor */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px 120px' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            display: 'block', width: '100%',
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            fontStyle: 'italic', fontWeight: 700, color: '#68142b',
            background: 'transparent', border: 'none', outline: 'none',
            marginBottom: '32px', lineHeight: 1.2,
          }}
        />
        <hr style={{ border: 'none', borderTop: '1px solid rgba(44,46,44,0.1)', marginBottom: '32px' }} />
        <EditorContent editor={editor} />
      </main>
    </div>
  );
}
