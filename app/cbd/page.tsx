"use client";
import { Suspense } from 'react'
import CbdList from '@/pages1/cbd/list'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx';

// export const metadata = {
//   title: '商圈管理 - Business System',
// }

export default function CbdListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CbdList />
    </Suspense>
  )
}
