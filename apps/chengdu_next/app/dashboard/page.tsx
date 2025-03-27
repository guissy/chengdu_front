"use client";
import { Suspense } from 'react'
import Dashboard from '@/(pages)/dashboard'
import {LoadingSpinner} from 'chengdu_ui';

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
