"use client";
import { Suspense } from 'react'
import PositionList from '@/(pages)/position/list'
import {LoadingSpinner} from 'chengdu_ui';

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
