interface StatCardProps {
  label: string
  value: string | number
  icon:  string
  color: 'brand' | 'success' | 'warning' | 'danger'
  delta?: string
}

const COLORS = {
  brand:   { wrap: 'bg-brand-50',   icon: 'text-brand-500',  val: 'text-brand-700'  },
  success: { wrap: 'bg-green-50',   icon: 'text-green-500',  val: 'text-green-700'  },
  warning: { wrap: 'bg-amber-50',   icon: 'text-amber-500',  val: 'text-amber-700'  },
  danger:  { wrap: 'bg-red-50',     icon: 'text-red-500',    val: 'text-red-700'    },
}

export function StatCard({ label, value, icon, color, delta }: StatCardProps) {
  const c = COLORS[color]
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.wrap}`}>
        <i className={`ti ti-${icon} text-xl ${c.icon}`} aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {delta && <p className={`text-xs mt-1 font-medium ${c.val}`}>{delta}</p>}
      </div>
    </div>
  )
}
