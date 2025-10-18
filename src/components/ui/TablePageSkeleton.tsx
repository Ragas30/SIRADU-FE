// skeletons/TablePageSkeleton.tsx

import { Skeleton } from "./skeleton"

export function TablePageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="rounded-lg border">
        {/* header row */}
        <div className="grid grid-cols-6 gap-2 border-b p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} className="grid grid-cols-6 gap-2 p-3 border-b last:border-none">
            {Array.from({ length: 6 }).map((__, c) => (
              <Skeleton key={c} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}
