import { Component, StrictMode, Suspense, lazy, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './styles/global.css';
import { AppProvider } from './context/AppContext';
import { SiteAudioProvider } from './context/SiteAudioContext';
import BlogLayout from './components/BlogLayout';

const App = lazy(() => import('./App'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Write = lazy(() => import('./pages/Write'));
const Photography = lazy(() => import('./pages/Photography'));

/* Recovers from lazy-chunk load failures (flaky network or a fresh deploy
   invalidating old chunk names), which otherwise leave a blank page. */
class ChunkErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error);
    const key = 'chunk-reload-at';
    const lastReload = Number(window.sessionStorage.getItem(key) ?? 0);
    if (Date.now() - lastReload > 10000) {
      window.sessionStorage.setItem(key, String(Date.now()));
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          onClick={() => window.location.reload()}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#faf9f7',
            color: '#68142b',
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <p>Something went wrong. Tap to reload.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'normal', fontSize: '12px', opacity: 0.55, marginTop: '16px', wordBreak: 'break-word' }}>
              {this.state.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RouteFallback() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#faf9f7',
      color: '#68142b',
      fontFamily: "'Libre Baskerville', Georgia, serif",
      fontStyle: 'italic',
      fontSize: '20px',
    }}>
      Loading...
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SiteAudioProvider>
        <ChunkErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<AppProvider><App /></AppProvider>} />
            <Route element={<BlogLayout />}>
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/write" element={<Write />} />
              <Route path="/write/:id" element={<Write />} />
              <Route path="/photography" element={<Photography />} />
            </Route>
          </Routes>
        </Suspense>
        </ChunkErrorBoundary>
        <Analytics />
      </SiteAudioProvider>
    </BrowserRouter>
  </StrictMode>,
);
