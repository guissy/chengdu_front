"use client";
import { Suspense, use } from 'react'
import PositionDetail from '@/(pages)/position/detail'
import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: '铺位详情 - Business System',
// }

export default function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const _params = use(params);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PositionDetail params={_params} />
    </Suspense>
  )
}

