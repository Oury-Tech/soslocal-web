'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, CheckCircle2, AlertCircle, MoreVertical, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export default function ArtisansAdminPage() {
  const { data: technicians = [] } = useAllTechnicians()
  const [search, setSearch] = useState('')

  const filtered = technicians.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.profession.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Artisans certifiés</h1>
        <p className="text-muted-foreground mt-1">
          Gestion et validation des artisans du programme Allô Maître.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',           value: technicians.length,                                color: 'brand' },
          { label: 'En ligne',        value: technicians.filter((t) => t.is_online).length,    color: 'green' },
          { label: 'Disponibles',     value: technicians.filter((t) => t.is_available).length, color: 'accent' },
          { label: 'En attente valid.', value: 3,                                               color: 'amber' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={cn('h-2 w-2 rounded-full animate-pulse',
                s.color === 'brand'  && 'bg-brand-500',
                s.color === 'green'  && 'bg-green-500',
                s.color === 'accent' && 'bg-accent-500',
                s.color === 'amber'  && 'bg-amber-500',
              )} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Rechercher par nom, profession…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="md">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                <th className="text-left font-medium px-5 py-3">Artisan</th>
                <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Profession</th>
                <th className="text-left font-medium px-5 py-3 hidden lg:table-cell">Note</th>
                <th className="text-left font-medium px-5 py-3 hidden lg:table-cell">Missions</th>
                <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Statut</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tech, i) => (
                <motion.tr
                  key={tech.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar fallback={getInitials(tech.name)} size="md" />
                        {tech.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm truncate">{tech.name}</span>
                          {tech.is_verified && (
                            <Award className="h-3.5 w-3.5 text-accent-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{tech.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm hidden md:table-cell">
                    <div className="font-medium">{tech.profession}</div>
                    {tech.hourly_rate && (
                      <div className="text-xs text-muted-foreground">{formatGNF(tech.hourly_rate)}/h</div>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold tabular-nums">{tech.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({tech.total_reviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm hidden lg:table-cell">
                    <div className="font-medium tabular-nums">{tech.total_jobs_completed}</div>
                    <div className="text-xs text-muted-foreground">{tech.completion_rate}% complétion</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {tech.is_available ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" />
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="default">Hors ligne</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
