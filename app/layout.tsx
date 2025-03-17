"use client";

import { Inter } from 'next/font/google'
import './globals.css'
import PageLayout from '@/components/layout/page-layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'
import { client } from '@/service/client.gen.ts';
import { useUiStore } from '@/store/ui.ts';
import { ToastProvider } from '@/components/ui/toast.tsx';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Business System',
//   description: 'Business System Frontend',
// }

client.setConfig({
  baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"}`,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

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
    <html lang="zh-CN">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <PageLayout>{children}</PageLayout>
          </ToastProvider>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
