"use client";
import { Suspense } from 'react'
import Dashboard from '@/pages1/dashboard'
import LoadingSpinner from '@/components/ui/loading-spinner';

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