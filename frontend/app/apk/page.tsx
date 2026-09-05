import { Smartphone, Hash, Fingerprint, ShieldAlert, TriangleAlert } from 'lucide-react'
import { Shell } from '@/components/dashboard/shell'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { RiskBadge } from '@/components/dashboard/risk-badge'

const SAMPLE = {
  fileName: 'WeddingInvitation.apk',
  package: 'com.free.invite.viewer',
  size: '6.4 MB',
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  minSdk: 'Android 6.0',
}

const PERMISSIONS: { name: string; desc: string; danger: boolean }[] = [
  { name: 'READ_SMS', desc: 'Reads SMS — can intercept OTPs', danger: true },
  { name: 'RECEIVE_SMS', desc: 'Receives incoming SMS silently', danger: true },
  { name: 'READ_CONTACTS', desc: 'Harvests the full contact list', danger: true },
  { name: 'BIND_ACCESSIBILITY_SERVICE', desc: 'Can read the screen and auto-tap', danger: true },
  { name: 'SYSTEM_ALERT_WINDOW', desc: 'Draws overlays over other apps', danger: true },
  { name: 'INTERNET', desc: 'Network access', danger: false },
  { name: 'READ_EXTERNAL_STORAGE', desc: 'Reads stored files', danger: false },
]

export default function ApkPage() {
  const dangerous = PERMISSIONS.filter((p) => p.danger).length

  return (
    <Shell title="APK Static Analysis" subtitle="Manifest & permission inspection — files are never executed">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UploadZone
            icon={Smartphone}
            accept="APK files up to 100 MB · static analysis only"
            note="Static analysis only. FraudShield never installs or runs an unknown APK. Live upload requires the backend service."
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Verdict */}
          <div
            className="glass-strong animate-rise rounded-3xl p-5"
            style={{ boxShadow: '0 0 50px -20px var(--risk-critical)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-risk-critical/15">
                  <ShieldAlert className="size-5 text-risk-critical" />
                </span>
                <div>
                  <div className="font-medium">{SAMPLE.fileName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{SAMPLE.package}</div>
                </div>
              </div>
              <RiskBadge risk="CRITICAL" className="text-sm" />
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-risk-critical/10 p-3 text-sm leading-relaxed">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-risk-critical" />
              Although the file is named an invitation viewer, it requests {dangerous} sensitive permissions
              including SMS, contacts and accessibility access. These are unnecessary for viewing an
              invitation and strongly indicate malicious behavior.
            </p>
          </div>

          {/* Fingerprint */}
          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">File Fingerprint</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={Fingerprint} label="Package" value={SAMPLE.package} />
              <Field icon={Smartphone} label="Min SDK" value={SAMPLE.minSdk} />
              <Field icon={Hash} label="Size" value={SAMPLE.size} />
              <Field icon={Hash} label="SHA-256" value={SAMPLE.sha256} mono truncate />
            </div>
          </div>

          {/* Permissions */}
          <div className="glass animate-rise overflow-hidden rounded-3xl">
            <div className="px-5 py-4 text-xs uppercase tracking-widest text-muted-foreground">
              Requested Permissions
            </div>
            <ul className="divide-y divide-border/40">
              {PERMISSIONS.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="font-mono text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                      p.danger ? 'bg-risk-critical/15 text-risk-critical' : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {p.danger ? 'DANGEROUS' : 'normal'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
  truncate,
}: {
  icon: typeof Hash
  label: string
  value: string
  mono?: boolean
  truncate?: boolean
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className={`mt-1 text-sm ${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : ''}`}>{value}</div>
    </div>
  )
}
