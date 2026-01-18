import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Önce localStorage'dan kontrol et
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored;
      }
    }
    
    // Varsayılan olarak 'system' kullan
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') || 'system';
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return stored;
    }
    return 'light';
  });

  // Theme değiştiğinde resolvedTheme'u güncelle
  useEffect(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      }
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eski class'ları temizle
    root.classList.remove('light', 'dark');
    
    // Yeni tema class'ını ekle
    root.classList.add(resolvedTheme);
    
    // LocalStorage'a kaydet
    localStorage.setItem('theme', theme);
  }, [theme, resolvedTheme]);

  // System preference değişikliklerini dinle
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    // İlk değeri ayarla
    setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const setThemeDirect = (newTheme) => {
    console.log('setThemeDirect called with:', newTheme);
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn('Invalid theme value:', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      resolvedTheme,
      setTheme: setThemeDirect, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
