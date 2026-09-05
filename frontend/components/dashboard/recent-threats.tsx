'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ThreatRecord } from '@/lib/sample-data'
import { RiskBadge } from './risk-badge'
import { ContentTypeTag } from './content-type-icon'

const STATUS_STYLE: Record<ThreatRecord['status'], string> = {
  Detected: 'text-risk-high',
  Reviewing: 'text-risk-medium',
  Cleared: 'text-primary',
}

export function RecentThreats({
  threats,
  title = 'Recent Threats',
  showViewAll = true,
}: {
  threats: ThreatRecord[]
  title?: string
  showViewAll?: boolean
}) {
  return (
    <div className="glass animate-rise overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2 items-center justify-center">
            <span className="absolute size-2 rounded-full bg-primary/50 animate-pulse-ring" />
            <span className="size-1.5 rounded-full bg-primary" />
          </span>
          <h2 className="font-medium">{title}</h2>
        </div>
        {showViewAll && (
          <Link href="/threats" className="text-xs text-primary hover:underline">
            View all
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground/70">
              <th className="px-5 py-2.5 font-medium">Time</th>
              <th className="px-3 py-2.5 font-medium">Type</th>
              <th className="px-3 py-2.5 font-medium">Detected Content</th>
              <th className="px-3 py-2.5 font-medium">Fraud Type</th>
              <th className="px-3 py-2.5 font-medium">Risk</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {threats.map((t) => (
              <tr
                key={t.id}
                className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/60"
              >
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.time}</td>
                <td className="px-3 py-3">
                  <ContentTypeTag type={t.contentType} />
                </td>
                <td className="px-3 py-3 font-medium">{t.detected}</td>
                <td className="px-3 py-3 text-muted-foreground">{t.fraudType}</td>
                <td className="px-3 py-3">
                  <RiskBadge risk={t.risk} />
                </td>
                <td className={`px-3 py-3 font-mono text-xs ${STATUS_STYLE[t.status]}`}>{t.status}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/threats/${t.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                    aria-label={`View details for ${t.detected}`}
                  >
                    Details
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
