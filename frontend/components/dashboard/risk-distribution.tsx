import { RISK_DISTRIBUTION } from '@/lib/sample-data'

export function RiskDistribution() {
  return (
    <div className="glass animate-rise flex h-full flex-col rounded-3xl p-5">
      <div className="mb-5">
        <h2 className="font-medium">Risk Distribution</h2>
        <p className="text-xs text-muted-foreground">Share of items by severity</p>
      </div>

      <ul className="flex flex-1 flex-col justify-center gap-4">
        {RISK_DISTRIBUTION.map((r) => (
          <li key={r.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-xs tracking-wide" style={{ color: `var(--${r.token})` }}>
                {r.label}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{r.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${r.value}%`,
                  background: `var(--${r.token})`,
                  boxShadow: `0 0 12px -2px var(--${r.token})`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
