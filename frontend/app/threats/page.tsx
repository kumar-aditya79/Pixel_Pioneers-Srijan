import { Shell } from '@/components/dashboard/shell'
import { RecentThreats } from '@/components/dashboard/recent-threats'
import { THREATS } from '@/lib/sample-data'
import type { RiskLevel } from '@/lib/fraud-engine'

const LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const TOKEN: Record<RiskLevel, string> = {
  CRITICAL: 'risk-critical',
  HIGH: 'risk-high',
  MEDIUM: 'risk-medium',
  LOW: 'risk-low',
}

export default function ThreatsPage() {
  const counts = LEVELS.map((level) => ({
    level,
    count: THREATS.filter((t) => t.risk === level).length,
  }))

  return (
    <Shell title="Threat Feed" subtitle="Every item analyzed by the fraud engine">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map(({ level, count }) => (
            <div key={level} className="glass rounded-2xl p-4">
              <div className="font-mono text-2xl font-semibold tabular-nums" style={{ color: `var(--${TOKEN[level]})` }}>
                {count}
              </div>
              <div className="text-xs text-muted-foreground">{level} risk</div>
            </div>
          ))}
        </div>

        <RecentThreats threats={THREATS} title="All Threats" showViewAll={false} />
      </div>
    </Shell>
  )
}
