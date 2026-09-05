import { FRAUD_TYPES } from '@/lib/sample-data'

const RADIUS = 60
const CIRC = 2 * Math.PI * RADIUS

export function FraudTypeChart() {
  let offset = 0
  const total = FRAUD_TYPES.reduce((s, f) => s + f.value, 0)

  return (
    <div className="glass animate-rise flex h-full flex-col rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium">Fraud Types</h2>
          <p className="text-xs text-muted-foreground">Distribution across detections</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
            <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="16" />
            {FRAUD_TYPES.map((f) => {
              const len = (f.value / total) * CIRC
              const seg = (
                <circle
                  key={f.label}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke={`var(--${f.token})`}
                  strokeWidth="16"
                  strokeDasharray={`${len} ${CIRC - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
              offset += len
              return seg
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-semibold">{FRAUD_TYPES[0].value}%</span>
            <span className="text-[11px] text-muted-foreground">{FRAUD_TYPES[0].label}</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-3">
          {FRAUD_TYPES.map((f) => (
            <li key={f.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: `var(--${f.token})` }} />
                {f.label}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{f.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
