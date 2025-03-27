"use client";
import { Suspense } from 'react'
import CbdList from '@/(pages)/cbd/list'
import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: '商圈管理 - Business System',
// }

export default function CbdListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CbdList />
    </Suspense>
  )
}
