"use client";
import { Suspense } from 'react'
import PositionList from '@/pages1/position/list'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx';

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
