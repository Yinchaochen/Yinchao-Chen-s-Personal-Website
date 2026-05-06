import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';

interface LatestBlogNoticeProps {
  visible: boolean;
}

interface LatestArticleSummary {
  slug: string;
  title: string;
  published_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LatestBlogNotice({ visible }: LatestBlogNoticeProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLButtonElement>(null);
  const [article, setArticle] = useState<LatestArticleSummary | null>(null);

  useEffect(() => {
    supabase
      .from('articles')
      .select('slug, title, published_at')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) return;
        setArticle((data?.[0] as LatestArticleSummary | undefined) ?? null);
      });
  }, []);

  useEffect(() => {
    if (!ref.current || !article) return;
    const el = ref.current;

    gsap.killTweensOf(el);

    if (visible) {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        delay: 1.05,
        ease: 'power3.out',
        pointerEvents: 'auto',
      });
      return;
    }

    gsap.to(el, {
      autoAlpha: 0,
      y: 24,
      duration: 0.3,
      ease: 'power2.in',
      pointerEvents: 'none',
    });
  }, [article, visible]);

  if (!article) return null;

  return (
    <button
      ref={ref}
      onClick={() => navigate(`/blog/${article.slug}`)}
      className="mm-shadow"
      style={{
        position: 'fixed',
        right: 'calc(var(--grid-val) * 1vw)',
        bottom: 'calc(var(--grid-val) * 0.75vw)',
        zIndex: 24,
        width: 'min(360px, calc(100vw - 32px))',
        padding: '16px 18px 15px',
        background: 'rgba(250, 249, 247, 0.95)',
        border: '1px solid rgba(104, 20, 43, 0.16)',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.65)',
        textAlign: 'left',
        color: '#68142b',
        opacity: 0,
        transform: 'translateY(24px)',
        pointerEvents: 'none',
        backdropFilter: 'blur(14px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span
          className="font-body"
          style={{
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}
        >
          Latest Blog
        </span>
        <span
          className="font-body"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.45,
            whiteSpace: 'nowrap',
          }}
        >
          {formatDate(article.published_at)}
        </span>
      </div>

      <p
        className="font-display"
        style={{
          marginTop: '10px',
          fontSize: 'clamp(18px, 2vw, 24px)',
          lineHeight: 1.2,
          fontWeight: 700,
          fontStyle: 'italic',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {article.title}
      </p>

      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          className="font-body"
          style={{
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          Read now
        </span>
        <span
          aria-hidden
          style={{
            width: '34px',
            height: '1px',
            background: 'rgba(104, 20, 43, 0.38)',
          }}
        />
      </div>
    </button>
  );
}
