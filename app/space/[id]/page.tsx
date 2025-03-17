"use client";
import { Suspense, use } from 'react'
import SpaceDetail from '@/pages1/space/detail'

// export const metadata = {
//   title: '广告位详情 - Business System',
// }

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const _params = use(params);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpaceDetail params={_params} />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
)
