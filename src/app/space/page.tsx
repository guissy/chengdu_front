"use client";
import { Suspense } from 'react'
import SpaceList from '@/pages1/space/list'

// export const metadata = {
//   title: '广告位管理 - Business System',
// }

export default function SpaceListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpaceList />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 