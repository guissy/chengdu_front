"use client";
import { Suspense } from 'react'
import Dashboard from '@/pages1/dashboard'

// export const metadata = {
//   title: '仪表盘 - Business System',
// }

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  )
}

// 加载指示器
const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 