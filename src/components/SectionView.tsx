import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';

/* ── Content per section ── */
const content = {
  programming: {
    zh: {
      title: '编程世界',
      body: '我是一名热爱创造的程序员。从中国的软件工程课堂到德国的编程实践，代码一直是我表达创意的语言。我相信技术不仅是解决问题的工具，更是连接人与世界的桥梁。',
      project: { name: 'Uchia', desc: '我的软件产品，一个正在开发中的创新项目', link: 'uchia.io' },
      tags: ['React', 'TypeScript', 'Node.js', 'Three.js'],
    },
    en: {
      title: 'Code World',
      body: "I'm a programmer passionate about creation. From software engineering classrooms in China to coding practice in Germany, code has always been my language of creativity. I believe technology is not just a problem-solving tool, but a bridge connecting people with the world.",
      project: { name: 'Uchia', desc: 'My software product — an innovative project in development', link: 'uchia.io' },
      tags: ['React', 'TypeScript', 'Node.js', 'Three.js'],
    },
    de: {
      title: 'Code-Welt',
      body: 'Ich bin ein Programmierer mit Leidenschaft für Kreation. Von Software-Engineering-Kursen in China bis zur Programmierpraxis in Deutschland — Code war immer meine kreative Sprache.',
      project: { name: 'Uchia', desc: 'Mein Software-Produkt — ein innovatives Projekt in Entwicklung', link: 'uchia.io' },
      tags: ['React', 'TypeScript', 'Node.js', 'Three.js'],
    },
  },
  photography: {
    zh: {
      title: '摄影之旅',
      body: '摄影是我观察世界的方式。从柏林的黄昏到布拉格的古建筑，从公园里的秋日阳光到窗台上的红色天竺葵，每一帧都是我与这个世界对话的瞬间。',
      photos: [
        { src: '/images/P1019454.jpg', title: '秋日公园' },
        { src: '/images/Blues Moment 03.jpg', title: '柏林黄昏' },
        { src: '/images/P1002527.jpg', title: '黄金时刻' },
        { src: '/images/P1019576.jpg', title: '布拉格屋顶' },
        { src: '/images/P1019780.jpg', title: '红色天竺葵' },
      ],
    },
    en: {
      title: 'Photography',
      body: 'Photography is my way of observing the world. From dusk in Berlin to Prague\'s ancient architecture, from autumn sunshine in the park to red geraniums on a windowsill — every frame is a moment of dialogue between me and this world.',
      photos: [
        { src: '/images/P1019454.jpg', title: 'Autumn Park' },
        { src: '/images/Blues Moment 03.jpg', title: 'Berlin Dusk' },
        { src: '/images/P1002527.jpg', title: 'Golden Hour' },
        { src: '/images/P1019576.jpg', title: 'Prague Rooftops' },
        { src: '/images/P1019780.jpg', title: 'Red Geraniums' },
      ],
    },
    de: {
      title: 'Fotografie',
      body: 'Fotografie ist meine Art, die Welt zu beobachten. Von der Dämmerung in Berlin bis zur alten Architektur Prags — jedes Bild ist ein Dialog.',
      photos: [
        { src: '/images/P1019454.jpg', title: 'Herbst Park' },
        { src: '/images/Blues Moment 03.jpg', title: 'Berlin Dämmerung' },
        { src: '/images/P1002527.jpg', title: 'Goldene Stunde' },
        { src: '/images/P1019576.jpg', title: 'Prager Dächer' },
        { src: '/images/P1019780.jpg', title: 'Rote Geranien' },
      ],
    },
  },
  youtube: {
    zh: {
      title: '视频与哲学',
      body: '我的 YouTube 频道 @LisumChen 是分享哲学思考和个人故事的空间。我相信视频不仅是记录，更是一种思考的方式 — 通过镜头探索存在的意义。',
      channel: '哲学 · 人生故事 · 跨文化思考',
    },
    en: {
      title: 'Video & Philosophy',
      body: 'My YouTube channel @LisumChen is a space for sharing philosophical reflections and personal stories. Video is not just documentation — it\'s a way of thinking, exploring the meaning of existence through the lens.',
      channel: 'Philosophy · Life Stories · Cross-cultural Thinking',
    },
    de: {
      title: 'Video & Philosophie',
      body: 'Mein YouTube-Kanal @LisumChen ist ein Raum für philosophische Reflexionen und persönliche Geschichten.',
      channel: 'Philosophie · Lebensgeschichten · Kulturelles Denken',
    },
  },
  journey: {
    zh: {
      title: '从东到西',
      body: '从中国到德国，这不仅是地理上的旅程，更是思想的迁徙。两年的德语学习让我深入当地社区，在文化的碰撞中找到了属于自己的位置。',
      timeline: [
        { year: '2004', text: '出生于中国' },
        { year: '2019', text: '就读于精英高中' },
        { year: '2022', text: '在中国开始学习软件工程' },
        { year: '2023', text: '来到德国，学习德语，融入社区' },
        { year: '现在', text: '在德国进行软件产品开发' },
      ],
    },
    en: {
      title: 'East to West',
      body: 'From China to Germany — not just a geographical journey, but a migration of thought. Two years of learning German immersed me in the local community, and in the collision of cultures, I found my own place.',
      timeline: [
        { year: '2004', text: 'Born in China' },
        { year: '2019', text: 'Enrolled in elite high school' },
        { year: '2022', text: 'Started studying Software Engineering in China' },
        { year: '2023', text: 'Moved to Germany, learned German, joined the community' },
        { year: 'Now', text: 'Developing software products in Germany' },
      ],
    },
    de: {
      title: 'Von Ost nach West',
      body: 'Von China nach Deutschland — nicht nur eine geographische Reise, sondern eine Migration des Denkens.',
      timeline: [
        { year: '2004', text: 'In China geboren' },
        { year: '2019', text: 'Elite-Gymnasium besucht' },
        { year: '2022', text: 'Software Engineering in China studiert' },
        { year: '2023', text: 'Nach Deutschland gezogen, Deutsch gelernt' },
        { year: 'Jetzt', text: 'Software-Produktentwicklung in Deutschland' },
      ],
    },
  },
  social: {
    zh: {
      title: '与我联系',
      body: '很高兴你来到这里。无论是技术合作、摄影交流，还是哲学探讨，我都期待与你的对话。',
    },
    en: {
      title: 'Connect',
      body: "Glad you're here. Whether it's tech collaboration, photography exchange, or philosophical discussion — I look forward to connecting.",
    },
    de: {
      title: 'Kontakt',
      body: 'Schön, dass du hier bist. Ob Technologie-Kollaboration, Fotografie-Austausch oder philosophische Diskussion.',
    },
  },
};

export default function SectionView({ onClose }: { onClose: () => void }) {
  const { activeSection, setActiveSection, lang } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSection) {
      gsap.set(overlayRef.current, { display: 'flex' });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.88, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.1)', delay: 0.05 });
      if (childrenRef.current) {
        gsap.fromTo(
          childrenRef.current.children,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.45, ease: 'power2.out', delay: 0.25 }
        );
      }
    } else {
      gsap.to([panelRef.current, overlayRef.current], {
        opacity: 0, duration: 0.3,
        onComplete: () => { if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' }); }
      });
    }
  }, [activeSection]);

  const close = () => {
    setActiveSection(null);
    onClose();
  };

  if (!activeSection) return (
    <div ref={overlayRef} style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 35, backdropFilter: 'blur(20px)', background: 'rgba(250,250,250,0.25)', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={panelRef}><div ref={childrenRef}/></div>
    </div>
  );

  const c = (content as any)[activeSection.id]?.[lang] || (content as any)[activeSection.id]?.['en'];

  return (
    <div
      ref={overlayRef}
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 35,
        backdropFilter: 'blur(20px)',
        background: 'rgba(250,250,250,0.25)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
    >
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: activeSection.color,
          width: 'min(90vw, 700px)',
          maxHeight: '85svh',
          overflow: 'auto',
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(44,46,44,0.2)',
        }}
      >
        {/* Decorative border */}
        <img
          src="/svgs/borders.svg" alt="" aria-hidden
          style={{ position: 'absolute', top: '-1%', left: '-1%', width: '102%', height: '102%', pointerEvents: 'none', color: 'var(--color-primary)' }}
        />

        {/* Content */}
        <div ref={childrenRef} style={{ padding: 'calc(var(--grid-val) * 1.5vw) calc(var(--grid-val) * 2vw)', position: 'relative' }}>

          {/* Subtitle tag */}
          <p className="font-body fs-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', opacity: 0.6, marginBottom: '8px' }}>
            {activeSection.subtitle[lang]}
          </p>

          {/* Title */}
          <h2 className="font-display fs-lg" style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.1 }}>
            {c.title}
          </h2>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(104,20,43,0.15)', margin: 'calc(var(--grid-val) * .5vw) 0' }} />

          {/* Body text */}
          <p className="font-body fs-xs" style={{ lineHeight: 1.8, color: 'var(--color-dark)' }}>{c.body}</p>

          {/* Programming: project card + tags */}
          {activeSection.id === 'programming' && c.project && (
            <>
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(104,20,43,0.06)', border: '1px solid rgba(104,20,43,0.12)' }}>
                <h3 className="font-display fs-sm" style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>{c.project.name}</h3>
                <p className="font-body fs-xs" style={{ marginTop: '6px', opacity: 0.7 }}>{c.project.desc}</p>
                <a
                  href="https://uchia.io/" target="_blank" rel="noopener noreferrer"
                  className="font-body fs-xs mm-shadow"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {c.project.link} ↗
                </a>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                {c.tags.map((t: string) => (
                  <span key={t} style={{ background: 'rgba(104,20,43,0.1)', color: 'var(--color-primary)', padding: '3px 12px', borderRadius: '20px', fontSize: 'max(10px, 0.7vw)', fontFamily: 'monospace' }}>{t}</span>
                ))}
              </div>
            </>
          )}

          {/* Photography: grid */}
          {activeSection.id === 'photography' && c.photos && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '24px' }}>
              {c.photos.map((p: any) => (
                <a key={p.src} href={p.src} target="_blank" rel="noopener noreferrer" style={{ display: 'block', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={p.src} alt={p.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  />
                </a>
              ))}
            </div>
          )}

          {/* YouTube: channel card */}
          {activeSection.id === 'youtube' && (
            <a
              href="https://www.youtube.com/@LisumChen" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                marginTop: '24px', padding: '24px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #c0485a 100%)',
                textDecoration: 'none',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fafafa"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div>
                <p className="font-body fs-xs" style={{ color: '#fafafa', opacity: 0.7, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>YouTube</p>
                <p className="font-display fs-sm" style={{ color: '#fafafa', fontStyle: 'italic', fontWeight: 700 }}>@LisumChen</p>
                <p className="font-body fs-xs" style={{ color: '#fafafa', opacity: 0.7, marginTop: '4px' }}>{c.channel}</p>
              </div>
            </a>
          )}

          {/* Journey: timeline */}
          {activeSection.id === 'journey' && c.timeline && (
            <div style={{ position: 'relative', marginTop: '24px', paddingLeft: '20px' }}>
              <div style={{ position: 'absolute', left: '4px', top: 0, bottom: 0, width: '1px', background: 'rgba(104,20,43,0.25)' }} />
              {c.timeline.map((item: any) => (
                <div key={item.year} style={{ display: 'flex', gap: '16px', marginBottom: '18px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: '5px', position: 'relative', zIndex: 1 }} />
                  <div>
                    <span className="font-display fs-xs" style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>{item.year}</span>
                    <span className="font-body fs-xs" style={{ color: 'var(--color-dark)', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social: grid of links */}
          {activeSection.id === 'social' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '24px' }}>
              {[
                { name: 'Instagram', handle: '@lisumwinrain', url: 'https://www.instagram.com/lisumwinrain/', color: '#E1306C' },
                { name: 'YouTube', handle: '@LisumChen', url: 'https://www.youtube.com/@LisumChen', color: '#FF0000' },
                { name: 'LinkedIn', handle: 'Yinchao Chen', url: 'https://www.linkedin.com/in/yinchao-chen-848038308', color: '#0077B5' },
                { name: 'Medium', handle: '@lisumchen', url: 'https://medium.com/@lisumchen', color: '#00ab6c' },
              ].map(s => (
                <a
                  key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '16px', background: 'rgba(250,250,250,0.7)',
                    border: '1px solid rgba(104,20,43,0.1)', textDecoration: 'none',
                    transition: 'transform 0.3s, border-color 0.3s',
                    color: 'var(--color-dark)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = s.color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(104,20,43,0.1)';
                  }}
                >
                  <span className="font-display fs-sm" style={{ fontWeight: 700, color: s.color }}>{s.name}</span>
                  <span className="font-body" style={{ fontSize: 'max(10px, 0.65vw)', opacity: 0.6 }}>{s.handle}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="mm-shadow"
          style={{
            position: 'absolute',
            bottom: 'calc(var(--grid-val) * -2.5vw)',
            left: '50%', transform: 'translateX(-50%)',
            width: 'calc(var(--grid-val) * 1.75vw)',
            height: 'calc(var(--grid-val) * 1.75vw)',
            minWidth: '44px', minHeight: '44px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <img src="/svgs/close.svg" alt="Close" style={{ width: '100%', height: '100%' }} />
        </button>
      </div>
    </div>
  );
}
