import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { AppProvider } from './context/AppContext';
import BlogLayout from './components/BlogLayout';

const App = lazy(() => import('./App'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Write = lazy(() => import('./pages/Write'));

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<AppProvider><App /></AppProvider>} />
          <Route element={<BlogLayout />}>
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/write" element={<Write />} />
            <Route path="/write/:id" element={<Write />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
