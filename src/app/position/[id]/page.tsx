"use client";
import { Suspense, use } from 'react'
import PositionDetail from '@/pages1/position/detail'

// export const metadata = {
//   title: '铺位详情 - Business System',
// }

export default function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const _params = use(params);
  return (
    <Suspense fallback={<LoadingSpinner params={_params} />}>
      <PositionDetail params={_params} />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
)
