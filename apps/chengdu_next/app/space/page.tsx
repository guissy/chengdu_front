"use client";
import { Suspense } from 'react'
import SpaceList from '@/(pages)/space/list'
import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: '广告位管理 - Business System',
// }

export default function SpaceListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpaceList />
    </Suspense>
  )
}
