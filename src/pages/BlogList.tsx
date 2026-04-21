import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Article } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BlogList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.from('articles').select('*').order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data ?? []); setLoading(false); });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

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
        <Link to="/" style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#68142b',
          letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7,
        }}>
          ← Portfolio
        </Link>
        <span style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '15px', fontStyle: 'italic', fontWeight: 700, color: '#68142b',
        }}>
          Writing
        </span>
        {session && (
          <Link to="/write" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#faf9f7', background: '#68142b',
            padding: '6px 16px', opacity: 0.9,
          }}>
            New Post
          </Link>
        )}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px 100px' }}>
        {loading && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#2c2e2c', opacity: 0.5 }}>
            Loading...
          </p>
        )}

        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: '22px', fontStyle: 'italic', color: '#2c2e2c', opacity: 0.4,
            }}>
              Nothing published yet.
            </p>
            <Link to="/write" style={{
              display: 'inline-block', marginTop: '24px',
              fontFamily: 'Inter, sans-serif', fontSize: '13px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#68142b', borderBottom: '1px solid #68142b',
              paddingBottom: '2px',
            }}>
              Write the first post →
            </Link>
          </div>
        )}

        {articles.map((article, i) => (
          <article key={article.id} style={{
            paddingBottom: '48px', marginBottom: '48px',
            borderBottom: i < articles.length - 1 ? '1px solid rgba(44,46,44,0.1)' : 'none',
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#2c2e2c', opacity: 0.45, marginBottom: '12px',
            }}>
              {formatDate(article.published_at)}
            </p>
            <Link to={`/blog/${article.slug}`} style={{ display: 'block' }}>
              <h2 style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontStyle: 'italic', fontWeight: 700,
                color: '#68142b', lineHeight: 1.25, marginBottom: '16px',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                {article.title}
              </h2>
            </Link>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '15px',
              lineHeight: 1.75, color: '#2c2e2c', opacity: 0.75,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {stripHtml(article.content).slice(0, 200)}
            </p>
            <Link to={`/blog/${article.slug}`} style={{
              display: 'inline-block', marginTop: '16px',
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#68142b', opacity: 0.8,
            }}>
              Read more →
            </Link>
          </article>
        ))}
      </main>
    </div>
  );
}
