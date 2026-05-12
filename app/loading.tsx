import { Logo } from '@/components/ui/logo'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 mesh-bg">
      <div className="animate-pulse">
        <Logo size="lg" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
        <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse animation-delay-200" />
        <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse animation-delay-400" />
      </div>
    </div>
  )
}
