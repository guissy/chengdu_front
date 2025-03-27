import { Suspense } from 'react'
import AuditList from '@/(pages)/audit/list'
import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: '审核列表 - Business System',
// }

export default function AuditListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuditList />
    </Suspense>
  )
}

