"use client";
import { Suspense } from 'react'
import Shop from '@/(pages)/shop/list'
import {LoadingSpinner} from 'chengdu_ui';

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
