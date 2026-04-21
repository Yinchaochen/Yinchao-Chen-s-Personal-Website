import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase, type Article } from '../lib/supabase';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from('articles').select('*').eq('slug', slug).single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/blog'); return; }
        setArticle(data);
        setLoading(false);
      });
  }, [slug, navigate]);

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
        <Link to={`/write/${article.id}`} style={{
          fontFamily: 'Inter, sans-serif', fontSize: '12px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#2c2e2c', opacity: 0.45,
        }}>
          Edit
        </Link>
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
          <img src={article.cover_image} alt="" style={{
            width: '100%', marginBottom: '48px',
            display: 'block',
          }} />
        )}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </main>
    </div>
  );
}
