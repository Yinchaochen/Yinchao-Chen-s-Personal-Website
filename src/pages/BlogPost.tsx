import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase, type Article } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import LazyImage from '../components/LazyImage';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function enhanceBlogContentImages(html: string) {
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('fetchpriority', 'low');
    img.setAttribute('data-lazy-blog-image', 'true');
  });

  return doc.body.innerHTML;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from('articles').select('*').eq('slug', slug).single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/blog'); return; }
        setArticle(data);
        setLoading(false);
      });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, [slug, navigate]);

  const htmlContent = useMemo(
    () => article ? enhanceBlogContentImages(article.content) : '',
    [article],
  );

  useEffect(() => {
    const images = contentRef.current?.querySelectorAll<HTMLImageElement>('img[data-lazy-blog-image="true"]');
    if (!images?.length) return;

    const cleanups: Array<() => void> = [];

    images.forEach((img) => {
      const markLoaded = () => img.classList.add('is-loaded');
      if (img.complete) {
        markLoaded();
        return;
      }

      img.addEventListener('load', markLoaded, { once: true });
      cleanups.push(() => img.removeEventListener('load', markLoaded));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [htmlContent]);

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#2c2e2c', opacity: 0.4 }}>Loading...</p>
    </div>
  );

  if (!article) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#faf9f7' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        background: '#faf9f7',
        borderBottom: '1px solid rgba(44,46,44,0.1)',
      }}>
        <Link to="/blog" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#68142b',
          letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7,
        }}>
          ← Writing
        </Link>
        <Link to="/" style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '15px', fontStyle: 'italic', fontWeight: 700, color: '#68142b',
        }}>
          Yinchao Chen
        </Link>
        {session && (
          <Link to={`/write/${article.id}`} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#2c2e2c', opacity: 0.45,
          }}>
            Edit
          </Link>
        )}
      </nav>

      {/* Article */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px 120px' }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '12px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#2c2e2c', opacity: 0.45, marginBottom: '20px',
        }}>
          {formatDate(article.published_at)}
        </p>

        <h1 style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: 'clamp(26px, 4vw, 44px)',
          fontStyle: 'italic', fontWeight: 700,
          color: '#68142b', lineHeight: 1.15,
          marginBottom: '48px',
        }}>
          {article.title}
        </h1>

        {article.cover_image && (
          <LazyImage
            src={article.cover_image}
            alt=""
            eager
            containerStyle={{ width: '100%', marginBottom: '48px' }}
            style={{
              width: '100%',
              display: 'block',
            }}
          />
        )}

        <div
          ref={contentRef}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>
    </div>
  );
}
