// EmptyState
interface EmptyStateProps {
  icon: string; title: string; desc?: string
  action?: { label: string; href: string }
}
export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <i className={`ti ti-${icon} text-3xl text-gray-300`} aria-hidden />
      </div>
      <p className="font-semibold text-gray-600">{title}</p>
      {desc && <p className="text-sm text-gray-400 mt-1">{desc}</p>}
      {action && (
        <a href={action.href} className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors">
          {action.label}
        </a>
      )}
    </div>
  )
}

// Skeleton
interface SkeletonProps { className?: string; height?: number|string; width?: number|string }
export function Skeleton({ className='', height, width }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-xl ${className}`}
      style={{ height: height ?? '1rem', width: width ?? '100%' }}
    />
  )
}
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded w-3/5" />
          <div className="h-3 bg-gray-100 rounded w-2/5" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
  )
}

// Avatar
interface AvatarProps { name: string; src?: string; size?: 'sm'|'md'|'lg'; online?: boolean }
const SZ = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
const DOT = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3.5 h-3.5' }
export function Avatar({ name, src, size='md', online }: AvatarProps) {
  return (
    <div className="relative inline-flex flex-shrink-0">
      {src
        ? <img src={src} alt={name} className={`${SZ[size]} rounded-full object-cover`} />
        : <div className={`${SZ[size]} rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center`}>{name.charAt(0).toUpperCase()}</div>
      }
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 ${DOT[size]} rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
      )}
    </div>
  )
}
