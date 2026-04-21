import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';

/* ── Per-section color theme (exact Max Mara palette) ── */
const THEMES: Record<string, { bg: string; border: string }> = {
  programming: { bg: '#eef6ff', border: '#00018d' },
  photography: { bg: '#e2ffec', border: '#326055' },
  youtube:     { bg: '#fffec5', border: '#855119' },
  journey:     { bg: '#edd7ff', border: '#44008d' },
  social:      { bg: '#e0fff8', border: '#054041' },
};

/* ── Full detail content per section ─────────────────── */
function SectionContent({ id }: { id: string }) {
  const { lang } = useApp();
  const navigate = useNavigate();

  if (id === 'programming') return (
    <div>
      <p className="fs-xs font-body" style={{ lineHeight: 1.8, color: '#2c2e2c' }}>
        {lang === 'zh'
          ? '从中国的软件工程课堂到德国的编程实践，代码一直是我表达创意的语言。'
          : lang === 'de'
          ? 'Von Software-Engineering in China bis zur Programmierpraxis in Deutschland — Code ist meine kreative Sprache.'
          : 'From software engineering classrooms in China to coding practice in Germany, code has always been my creative language.'}
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'12px' }}>
        <a href="https://uchia.io/" target="_blank" rel="noopener noreferrer"
          className="font-display fs-sm"
          style={{ fontStyle:'italic', fontWeight:700, color:'inherit', textDecoration:'underline' }}>
          uchia.io ↗
        </a>
        <a href="https://github.com/Yinchaochen" target="_blank" rel="noopener noreferrer"
          className="font-display fs-sm"
          style={{ fontStyle:'italic', fontWeight:700, color:'inherit', textDecoration:'underline' }}>
          github.com/Yinchaochen ↗
        </a>
      </div>
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'10px' }}>
        {['React','TypeScript','Node.js','Three.js'].map(t => (
          <span key={t} style={{ fontSize:'max(10px, 0.65vw)', fontFamily:'monospace', background:'rgba(0,1,141,0.1)', color:'#00018d', padding:'2px 8px', borderRadius:'12px' }}>{t}</span>
        ))}
      </div>
    </div>
  );

  if (id === 'photography') return (
    <div>
      <p className="fs-xs font-body" style={{ lineHeight: 1.8, color: '#2c2e2c' }}>
        {lang === 'zh'
          ? '从柏林的黄昏到布拉格的古建筑，每一帧都是与这个世界对话的瞬间。'
          : lang === 'de'
          ? 'Von der Dämmerung in Berlin bis zur alten Architektur Prags — jedes Bild ist ein Dialog.'
          : "From dusk in Berlin to Prague's architecture — every frame is a dialogue with the world."}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px', marginTop:'12px' }}>
        {['/images/P1019454.jpg','/images/Blues Moment 03.jpg','/images/P1002527.jpg','/images/P1019576.jpg','/images/P1019780.jpg'].map(src => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" style={{ display:'block', aspectRatio:'1', overflow:'hidden' }}>
            <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s', display:'block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}
            />
          </a>
        ))}
      </div>
    </div>
  );

  if (id === 'youtube') return (
    <div>
      <p className="fs-xs font-body" style={{ lineHeight: 1.8, color: '#2c2e2c' }}>
        {lang === 'zh'
          ? '哲学思考与人生故事的空间。视频是一种思考方式，通过镜头探索存在的意义。'
          : lang === 'de'
          ? 'Ein Raum für philosophische Reflexionen und persönliche Geschichten.'
          : "A space for philosophical reflections and personal stories. Video is a way of thinking."}
      </p>
      <a
        href="https://www.youtube.com/@LisumChen" target="_blank" rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginTop: '14px', padding: '18px 20px',
          background: 'linear-gradient(135deg, #68142b 0%, #c0485a 100%)',
          textDecoration: 'none',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(104,20,43,0.35)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fafafa"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
        <div>
          <p className="font-body fs-xs" style={{ color: '#fafafa', opacity: 0.7, marginBottom: '3px', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 'max(9px, 0.6vw)' }}>YouTube</p>
          <p className="font-display fs-sm" style={{ color: '#fafafa', fontStyle: 'italic', fontWeight: 700 }}>@LisumChen</p>
          <p className="font-body fs-xs" style={{ color: '#fafafa', opacity: 0.7, marginTop: '3px', fontSize: 'max(9px, 0.6vw)' }}>
            {lang === 'zh' ? '哲学 · 人生故事 · 跨文化思考' : lang === 'de' ? 'Philosophie · Lebensgeschichten' : 'Philosophy · Life Stories · Cross-cultural Thinking'}
          </p>
        </div>
      </a>
    </div>
  );

  if (id === 'journey') return (
    <div>
      <div style={{ position:'relative', paddingLeft:'16px' }}>
        <div style={{ position:'absolute', left:'3px', top:0, bottom:0, width:'1px', background:'rgba(68,0,141,0.3)' }} />
        {[
          { y:'2004', t: lang==='zh'?'出生于中国':lang==='de'?'In China geboren':'Born in China' },
          { y:'2022', t: lang==='zh'?'开始学习软件工程':lang==='de'?'Software Engineering studiert':'Started studying Software Engineering' },
          { y:'2023', t: lang==='zh'?'来到德国，学习德语':lang==='de'?'Nach Deutschland gezogen':'Moved to Germany, learned German' },
          { y: lang==='zh'?'现在':lang==='de'?'Jetzt':'Now', t: lang==='zh'?'在德国进行软件产品开发':lang==='de'?'Software-Entwicklung in Deutschland':'Developing software products in Germany' },
        ].map(item => (
          <div key={item.y} style={{ display:'flex', gap:'10px', marginBottom:'10px', alignItems:'flex-start' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#44008d', flexShrink:0, marginTop:'4px', position:'relative', zIndex:1 }} />
            <div>
              <span className="font-display fs-xs" style={{ fontWeight:700, display:'block', fontSize:'max(10px,0.65vw)' }}>{item.y}</span>
              <span className="font-body fs-xs" style={{ opacity:0.8, fontSize:'max(10px,0.65vw)' }}>{item.t}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Blog entry point */}
      <div style={{ marginTop:'14px' }}>
        <button
          onClick={() => navigate('/blog')}
          className="font-body fs-xs"
          style={{
            width:'100%', padding:'8px 0', border:'1px solid rgba(68,0,141,0.35)',
            background:'transparent', color:'#44008d', cursor:'pointer',
            fontSize:'max(10px,0.65vw)', letterSpacing:'0.06em', textTransform:'uppercase',
            transition:'background 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(68,0,141,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}
        >
          Blog
        </button>
      </div>
    </div>
  );

  if (id === 'social') return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginTop:'4px' }}>
      {[
        { name:'Instagram', handle:'@lisumwinrain', url:'https://www.instagram.com/lisumwinrain/' },
        { name:'YouTube',   handle:'@LisumChen',    url:'https://www.youtube.com/@LisumChen' },
        { name:'LinkedIn',  handle:'Yinchao Chen',  url:'https://www.linkedin.com/in/yinchao-chen-848038308' },
        { name:'Medium',    handle:'@lisumchen',    url:'https://medium.com/@lisumchen' },
      ].map(s => (
        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', flexDirection:'column', padding:'8px', background:'rgba(255,255,255,0.5)', border:'1px solid rgba(5,64,65,0.2)', textDecoration:'none', color:'#054041', transition:'background 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.85)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.5)'; }}
        >
          <span className="font-display fs-xs" style={{ fontWeight:700, fontStyle:'italic', fontSize:'max(10px,0.7vw)' }}>{s.name}</span>
          <span className="font-body" style={{ fontSize:'max(9px,0.6vw)', opacity:0.65 }}>{s.handle}</span>
        </a>
      ))}
    </div>
  );

  return null;
}

/* ── Main Accordion ───────────────────────────────────── */
export default function Accordion() {
  const { activeSection, lang } = useApp();
  const rootRef    = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iconPlusRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const theme = activeSection ? THEMES[activeSection.id] : THEMES.social;

  /* Slide in / out */
  useEffect(() => {
    if (!rootRef.current) return;
    if (activeSection) {
      setOpen(false); // reset expand state on new section
      gsap.fromTo(rootRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.95 }
      );
    } else {
      gsap.to(rootRef.current, { y: 80, opacity: 0, duration: 0.35, ease: 'power2.in' });
    }
  }, [activeSection]);

  /* Expand / collapse content */
  useEffect(() => {
    if (!wrapperRef.current || !iconPlusRef.current) return;
    if (open) {
      gsap.to(wrapperRef.current, { maxHeight: 800, duration: 0.75, ease: 'power2.inOut' });
      gsap.to(iconPlusRef.current, { scaleY: 0, duration: 0.4, ease: 'power2.inOut' });
    } else {
      gsap.to(wrapperRef.current, { maxHeight: 0, duration: 0.6, ease: 'power2.inOut' });
      gsap.to(iconPlusRef.current, { scaleY: 1, duration: 0.4, ease: 'power2.inOut' });
    }
  }, [open]);

  if (!activeSection) return <div ref={rootRef} style={{ position:'fixed', bottom:'calc(var(--grid-val)*0.5vw)', left:'calc(var(--grid-val)*1vw)', zIndex:20, opacity:0, pointerEvents:'none' }} />;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--grid-val) * 0.5vw)',
        left: 'calc(var(--grid-val) * 1vw)',
        zIndex: 20,
        width: 'calc(var(--grid-val) * 9vw)',
        minWidth: '260px',
        maxWidth: '420px',
        background: theme.bg,
        border: `2px solid ${theme.border}`,
        color: theme.border,
        padding: 'calc(var(--grid-val) * 0.5vw)',
        opacity: 0,
        /* inner border replica */
        boxShadow: `inset 0 0 0 4px ${theme.bg}, inset 0 0 0 6px ${theme.border}44`,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr calc(var(--grid-val) * 1vw)',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(v => !v)}
      >
        <div>
          <div className="font-display fs-sm" style={{ fontStyle: 'italic', fontWeight: 700, textTransform: 'capitalize', lineHeight: 1.1 }}>
            {activeSection.label[lang]}
          </div>
          <p className="font-body fs-xs" style={{ marginTop: '2px', opacity: 0.7, fontSize: 'max(10px, 0.65vw)' }}>
            {activeSection.subtitle[lang]}
          </p>
        </div>

        {/* +/- icon */}
        <button
          onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
          style={{
            width: 'calc(var(--grid-val) * 1vw)', minWidth: '28px',
            aspectRatio: '1',
            background: 'none', border: `1.5px solid ${theme.border}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.border, flexShrink: 0,
            filter: 'drop-shadow(2px 2px rgba(44,46,44,0.25))',
            transition: 'filter 0.3s cubic-bezier(.215,.61,.355,1)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 0 transparent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(2px 2px rgba(44,46,44,0.25))'; }}
        >
          <svg width="55%" height="55%" viewBox="0 0 16 16" fill="none">
            {/* Horizontal bar (always) */}
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Vertical bar (disappears when open) */}
            <line
              ref={iconPlusRef as any}
              x1="8" y1="2" x2="8" y2="14"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              style={{ transformOrigin: '50% 50%', display: 'block' }}
            />
          </svg>
        </button>
      </div>

      {/* Expandable content */}
      <div
        ref={wrapperRef}
        style={{ maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.75s cubic-bezier(.215,.61,.355,1)' }}
      >
        <div style={{ padding: 'calc(var(--grid-val) * 0.4vw) 0 calc(var(--grid-val) * 0.2vw)' }}>
          <hr style={{ border: 'none', borderTop: `1.5px solid ${theme.border}`, marginBottom: 'calc(var(--grid-val) * 0.3vw)' }} />
          <SectionContent id={activeSection.id} />
        </div>
      </div>
    </div>
  );
}
