"use client";
import { Suspense } from 'react'
import ShopList from '@/pages1/shop/list'

// export const metadata = {
//   title: '商家管理 - Business System',
// }

export default function ShopListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopList />
    </Suspense>
  )
}

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 