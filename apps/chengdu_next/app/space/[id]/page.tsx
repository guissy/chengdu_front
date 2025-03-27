"use client";
import { Suspense, use } from 'react'
import SpaceDetail from '@/(pages)/space/detail'
import {LoadingSpinner} from 'chengdu_ui';

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


