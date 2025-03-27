import { useEffect } from 'react';
import { useUiStore } from '../../store/ui';

const useTheme = () => {
  const { theme, setTheme } = useUiStore();

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // 如果本地存储没有主题，则使用系统主题
    if (!localStorage.getItem('theme')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]); // 监听 `theme` 变化

  return { theme, setTheme };
};

export default useTheme;
