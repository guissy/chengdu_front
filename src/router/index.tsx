import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { routes } from './routes';
import PageLayout from '@/components/layout/page-layout';

// 加载指示器
const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
);

// 404页面
const NotFoundPage = lazy(() => import('@/pages/error/not-found'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* 默认重定向到仪表盘 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 布局包装的路由 */}
        <Route path="/" element={<PageLayout />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <route.component />
                </Suspense>
              }
            />
          ))}
        </Route>

        {/* 404 页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
