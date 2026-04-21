import { useApp } from '../context/AppContext';

export default function RotateWarning() {
  const { lang } = useApp();
  return (
    <div className="rotate">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>
        <rect x="8" y="12" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M20 36 L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 8 C40 12 40 36 36 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="3 3"/>
      </svg>
      <span className="font-display fs-xl" style={{ fontStyle: 'italic', color: 'var(--color-primary)', textAlign: 'center', display: 'block' }}>
        {lang === 'zh' ? '请旋转设备' : lang === 'de' ? 'Gerät drehen' : 'Please Rotate'}
      </span>
    </div>
  );
}
