import { MessageCircle, SlidersHorizontal, ShieldCheck, Lock } from 'lucide-react'
import { Shell } from '@/components/dashboard/shell'

const THRESHOLDS = [
  { level: 'LOW', range: '0 – 24', token: 'risk-low' },
  { level: 'MEDIUM', range: '25 – 49', token: 'risk-medium' },
  { level: 'HIGH', range: '50 – 74', token: 'risk-high' },
  { level: 'CRITICAL', range: '75 – 100', token: 'risk-critical' },
]

const WEIGHTS = [
  { label: 'Known malicious reputation', weight: '+40' },
  { label: 'Brand impersonation / lookalike', weight: '+20' },
  { label: 'OTP / credential / payment request', weight: '+15' },
  { label: 'Dangerous APK permissions', weight: '+25' },
  { label: 'Urgency / threat language', weight: '+10' },
  { label: 'Suspicious redirect / shortener', weight: '+10' },
]

const PRIVACY = [
  { label: 'Analyze only user-submitted content', on: true },
  { label: 'Never store OTP / PIN / card details', on: true },
  { label: 'Static analysis only for APK files', on: true },
  { label: 'Webhook signature validation', on: true },
  { label: 'Rate limiting on inbound requests', on: true },
]

export default function SettingsPage() {
  return (
    <Shell title="Settings" subtitle="Engine tuning, integration and privacy controls">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* WhatsApp integration */}
        <div className="glass animate-rise rounded-3xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" />
            <h2 className="font-medium">WhatsApp Integration</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Users forward suspicious content to the FraudShield bot via the official WhatsApp Business
            API through Twilio. The backend receives content through a validated webhook — FraudShield
            never reads private inboxes.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Row label="Provider" value="Twilio WhatsApp" />
            <Row label="Webhook" value="POST /routes/whatsapp" mono />
            <Row label="Status" value="Awaiting backend" tone="risk-medium" />
          </div>
        </div>

        {/* Risk thresholds */}
        <div className="glass animate-rise rounded-3xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-medium">Risk Thresholds</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THRESHOLDS.map((t) => (
              <div key={t.level} className="rounded-2xl bg-white/[0.03] p-3">
                <div className="font-mono text-sm font-semibold" style={{ color: `var(--${t.token})` }}>
                  {t.level}
                </div>
                <div className="font-mono text-xs text-muted-foreground">score {t.range}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Prototype values — tunable per deployment.</p>
        </div>

        {/* Scoring weights */}
        <div className="glass animate-rise rounded-3xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="font-medium">Signal Weights</h2>
          </div>
          <ul className="divide-y divide-border/40">
            {WEIGHTS.map((w) => (
              <li key={w.label} className="flex items-center justify-between py-2.5 text-sm">
                <span>{w.label}</span>
                <span className="font-mono text-primary">{w.weight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy */}
        <div className="glass animate-rise rounded-3xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <h2 className="font-medium">Privacy &amp; Security</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {PRIVACY.map((p) => (
              <li key={p.label} className="flex items-center justify-between text-sm">
                <span>{p.label}</span>
                <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary/30">
                  <span className="absolute right-0.5 size-4 rounded-full bg-primary shadow" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  )
}

function Row({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''}`} style={tone ? { color: `var(--${tone})` } : undefined}>
        {value}
      </span>
    </div>
  )
}
