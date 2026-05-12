'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/badge'

export const DynamicMap = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
})
