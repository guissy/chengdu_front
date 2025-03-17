"use client";
import { Suspense } from 'react'
import CbdList from '@/pages1/cbd/list'

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

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 