import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Sparkles, XCircle, CheckCircle2, ShieldCheck, Quote } from 'lucide-react'
import { Shell } from '@/components/dashboard/shell'
import { RiskBadge } from '@/components/dashboard/risk-badge'
import { ContentTypeTag } from '@/components/dashboard/content-type-icon'
import { THREATS } from '@/lib/sample-data'
import { RISK_META } from '@/lib/fraud-engine'

export function generateStaticParams() {
  return THREATS.map((t) => ({ id: t.id }))
}

export default async function ThreatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const threat = THREATS.find((t) => t.id === id)
  if (!threat) notFound()

  const token = RISK_META[threat.risk].token
  const explanation = `This item is ${threat.risk.toLowerCase()} risk and classified as ${threat.fraudType.toLowerCase()} because ${threat.evidence
    .slice(0, 3)
    .map((e) => e.toLowerCase())
    .join(', ')}.`

  return (
    <Shell title="Threat Details" subtitle={`Case ${threat.id}`}>
      <Link
        href="/threats"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to threats
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: overview + evidence */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div
            className="glass-strong animate-rise rounded-3xl p-6"
            style={{ boxShadow: `0 0 50px -20px var(--${token})` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="glow-primary flex size-12 items-center justify-center rounded-2xl bg-primary/15">
                  <ShieldCheck className="size-6 text-primary" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{threat.detected}</h2>
                    <ContentTypeTag type={threat.contentType} />
                  </div>
                  <p className="text-sm text-muted-foreground">{threat.fraudType}</p>
                </div>
              </div>
              <RiskBadge risk={threat.risk} className="text-sm" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="Risk" value={threat.risk} token={token} />
              <Metric label="Confidence" value={`${threat.confidence}%`} token={token} />
              <Metric label="Content" value={threat.contentType} token="primary" />
            </div>
          </div>

          {threat.raw && (
            <div className="glass animate-rise rounded-3xl p-5">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Quote className="size-3.5" />
                Submitted Content
              </div>
              <p className="rounded-2xl bg-black/30 p-4 font-mono text-sm leading-relaxed text-foreground/90">
                {threat.raw}
              </p>
            </div>
          )}

          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Evidence</div>
            <ul className="flex flex-col gap-2.5">
              {threat.evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className="mt-1 size-1.5 shrink-0 rounded-full"
                    style={{ background: `var(--${token})` }}
                  />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: AI explanation + recommendation */}
        <div className="flex flex-col gap-4">
          <div className="glass animate-rise rounded-3xl border border-primary/20 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" />
              AI Explanation
            </div>
            <p className="text-sm leading-relaxed text-pretty">{explanation}</p>
          </div>

          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Recommendation</div>
            <ul className="flex flex-col gap-2.5">
              {threat.recommendation.map((r, i) => {
                const dont = r.toLowerCase().startsWith("don't")
                return (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {dont ? (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-risk-critical" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                    <span>{r}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Metric({ label, value, token }: { label: string; value: string; token: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-semibold" style={{ color: `var(--${token})` }}>
        {value}
      </div>
    </div>
  )
}
