import { Sparkles, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react'
import type { FraudReport } from '@/lib/fraud-engine'
import { RISK_META } from '@/lib/fraud-engine'
import { RiskBadge } from './risk-badge'
import { cn } from '@/lib/utils'

const CAT_LABEL: Record<string, string> = {
  impersonation: 'Impersonation',
  urgency: 'Urgency',
  threat: 'Threat',
  credential: 'Sensitive Info',
  payment: 'Payment',
  instruction: 'Instruction',
  url: 'URL',
  reputation: 'Reputation',
}

export function ReportCard({ report }: { report: FraudReport }) {
  const token = RISK_META[report.risk].token
  const clean = report.signals.length === 0

  return (
    <div className="animate-rise flex flex-col gap-4">
      {/* Header: risk + score gauge */}
      <div
        className="glass-strong relative overflow-hidden rounded-2xl p-5"
        style={{ boxShadow: `0 0 40px -18px var(--${token})` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">FraudShield Report</span>
          </div>
          <RiskBadge risk={report.risk} />
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Fraud Type</div>
            <div className="text-lg font-semibold">{report.fraudType}</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {report.contentType} · estimated confidence {Math.min(99, report.score + 6)}%
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-semibold tabular-nums" style={{ color: `var(--${token})` }}>
              {report.score}
            </div>
            <div className="text-[11px] text-muted-foreground">risk score / 100</div>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${report.score}%`, background: `var(--${token})`, boxShadow: `0 0 12px -2px var(--${token})` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Summary</div>
        <p className="text-sm leading-relaxed text-pretty">{report.summary}</p>
      </div>

      {/* Evidence signals */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Why is it suspicious?
        </div>
        {clean ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4" />
            No fraud indicators detected.
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {report.signals.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                  +{s.weight}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {s.label}
                    <span className="rounded bg-muted px-1.5 text-[10px] font-normal text-muted-foreground">
                      {CAT_LABEL[s.category] ?? s.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI explanation */}
      <div className="glass rounded-2xl border border-primary/20 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" />
          AI Explanation
        </div>
        <p className="text-sm leading-relaxed text-pretty">{report.explanation}</p>
      </div>

      {/* Recommendations */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          What should you do?
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {report.recommendations.map((r, i) => {
            const dont = r.toLowerCase().startsWith("don't")
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                {dont ? (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-risk-critical" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                )}
                <span className={cn(dont && 'text-foreground')}>{r}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
