import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { AppProvider } from './context/AppContext';
import App from './App';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Write from './pages/Write';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppProvider><App /></AppProvider>} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/write" element={<Write />} />
        <Route path="/write/:id" element={<Write />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
