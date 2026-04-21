'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agenthire-theme');
    const initial = saved || 'dark';
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function applyTheme(t) {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove('light', 'dark');
    html.classList.add(t);

    if (t === 'light') {
      body.style.background = '#f4f6fb';
      body.style.color = '#0f172a';
    } else {
      body.style.background = '#060714';
      body.style.color = '#ffffff';
    }
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('agenthire-theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div style={{ background: '#060714', color: '#ffffff', minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'dark', toggleTheme: () => {} };
  return ctx;
}