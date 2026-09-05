import { ScanSearch, ShieldAlert, Flame, Siren } from 'lucide-react'
import { STATS } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const CARDS = [
  {
    label: 'Total Scanned',
    value: STATS.totalScanned,
    hint: 'Messages, URLs & files analyzed',
    delta: '+12.4%',
    icon: ScanSearch,
    tone: 'text-primary',
    ring: 'bg-primary/15',
  },
  {
    label: 'Fraud Detected',
    value: STATS.fraudDetected,
    hint: 'Suspicious items flagged',
    delta: '+8.1%',
    icon: ShieldAlert,
    tone: 'text-risk-medium',
    ring: 'bg-risk-medium/15',
  },
  {
    label: 'High Risk',
    value: STATS.highRisk,
    hint: 'High-risk items',
    delta: '+5.7%',
    icon: Flame,
    tone: 'text-risk-high',
    ring: 'bg-risk-high/15',
  },
  {
    label: 'Critical',
    value: STATS.critical,
    hint: 'Critical threats',
    delta: '+3.2%',
    icon: Siren,
    tone: 'text-risk-critical',
    ring: 'bg-risk-critical/15',
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card, i) => (
        <div
          key={card.label}
          className="glass animate-rise group relative overflow-hidden rounded-3xl p-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className={cn('flex size-11 items-center justify-center rounded-2xl', card.ring)}>
              <card.icon className={cn('size-5', card.tone)} />
            </div>
            <span className="font-mono text-xs text-primary">{card.delta}</span>
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
              {card.value.toLocaleString()}
            </div>
            <div className="mt-1 text-sm font-medium">{card.label}</div>
            <div className="text-xs text-muted-foreground">{card.hint}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
