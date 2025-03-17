"use client";
import { Suspense } from 'react'
import PartList from '@/pages1/part/list'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx';

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
