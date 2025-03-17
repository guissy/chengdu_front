"use client";
import { Suspense } from 'react'
import PositionList from '@/pages1/position/list'

// export const metadata = {
//   title: '铺位管理 - Business System',
// }

export default function PositionListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PositionList />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 