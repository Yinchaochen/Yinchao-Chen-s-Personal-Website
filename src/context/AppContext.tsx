import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'zh' | 'en' | 'de';

export interface Section {
  id: string;
  label: { zh: string; en: string; de: string };
  subtitle: { zh: string; en: string; de: string };
  color: string;
  position: [number, number]; // 0-1 relative to canvas
}

export const sections: Section[] = [
  {
    id: 'programming',
    label: { zh: '编程', en: 'Code', de: 'Code' },
    subtitle: { zh: '从代码到创造', en: 'From Code to Creation', de: 'Vom Code zur Kreation' },
    color: '#eef6ff',
    position: [0.22, 0.38],
  },
  {
    id: 'photography',
    label: { zh: '摄影', en: 'Photography', de: 'Fotografie' },
    subtitle: { zh: '用镜头观察世界', en: 'Through the Lens', de: 'Durch das Objektiv' },
    color: '#e2ffec',
    position: [0.68, 0.28],
  },
  {
    id: 'youtube',
    label: { zh: '视频', en: 'Video', de: 'Video' },
    subtitle: { zh: '哲学与人生故事', en: 'Philosophy & Stories', de: 'Philosophie & Geschichten' },
    color: '#fffec5',
    position: [0.42, 0.62],
  },
  {
    id: 'journey',
    label: { zh: '旅程', en: 'Journey', de: 'Reise' },
    subtitle: { zh: '从东方到西方', en: 'East to West', de: 'Von Ost nach West' },
    color: '#edd7ff',
    position: [0.78, 0.58],
  },
  {
    id: 'social',
    label: { zh: '联系', en: 'Connect', de: 'Kontakt' },
    subtitle: { zh: '期待与你的对话', en: 'Let\'s Talk', de: 'Lass uns reden' },
    color: '#e0fff8',
    position: [0.14, 0.70],
  },
];

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (obj: { zh: string; en: string; de: string }) => string;
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  activeSection: Section | null;
  setActiveSection: (s: Section | null) => void;
  activeSceneId: string | null;
  setActiveSceneId: (id: string | null) => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const t = (obj: { zh: string; en: string; de: string }) => obj[lang];

  return (
    <AppContext.Provider value={{
      lang, setLang, t,
      loaded, setLoaded,
      activeSection, setActiveSection,
      activeSceneId, setActiveSceneId,
      navOpen, setNavOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
