"use client";
import { Suspense } from 'react'
import Shop from '@/pages1/shop/list'
import LoadingSpinner from '@/components/ui/loading-spinner';

// export const metadata = {
//   title: '商家管理 - Business System',
// }

export default function ShopListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Shop />
    </Suspense>
  )
} 