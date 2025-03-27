"use client";
import { Suspense, use } from 'react'
import PartDetail from '@/(pages)/part/detail'
import {LoadingSpinner} from 'chengdu_ui';

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
