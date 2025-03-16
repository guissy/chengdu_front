"use client";
import { Suspense, use } from 'react'
import PartDetail from '@/pages1/part/detail'

// export const metadata = {
//   title: '小区详情 - Business System',
// }

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const _params = use(params);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PartDetail params={_params} />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
)
