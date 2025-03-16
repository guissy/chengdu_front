"use client";
import { Suspense } from 'react'
import DistrictList from '@/pages1/district/list'

// export const metadata = {
//   title: '行政区划 - Business System',
// }

export default function DistrictListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DistrictList />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
)
