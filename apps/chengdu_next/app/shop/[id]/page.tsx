"use client";
import { Suspense, use } from 'react'
import ShopDetail from '@/(pages)/shop/detail'
import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: '商家详情 - Business System',
// }

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const _params = use(params);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopDetail params={_params} />
    </Suspense>
  )
}

