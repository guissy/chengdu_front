import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router';
import { useEffect } from 'react';
import { useUiStore } from './store/ui';

function App() {
  const { theme, setTheme } = useUiStore();

  // 主题监听和应用
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // 初始设置
    if (!localStorage.getItem('theme')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;