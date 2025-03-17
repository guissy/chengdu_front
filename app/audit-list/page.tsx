import { Suspense } from 'react'
import AuditList from '@/pages1/audit/list'

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

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
) 