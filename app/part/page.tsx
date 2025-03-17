"use client";
import { Suspense } from 'react'
import PartList from '@/pages1/part/list'

// export const metadata = {
//   title: '物业小区 - Business System',
// }

export default function PartListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PartList />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 