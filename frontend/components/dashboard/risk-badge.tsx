import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/lib/fraud-engine'

const STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-risk-low/15 text-risk-low border-risk-low/30',
  MEDIUM: 'bg-risk-medium/15 text-risk-medium border-risk-medium/30',
  HIGH: 'bg-risk-high/15 text-risk-high border-risk-high/30',
  CRITICAL: 'bg-risk-critical/15 text-risk-critical border-risk-critical/40',
}

const DOT: Record<RiskLevel, string> = {
  LOW: 'bg-risk-low',
  MEDIUM: 'bg-risk-medium',
  HIGH: 'bg-risk-high',
  CRITICAL: 'bg-risk-critical',
}

export function RiskBadge({
  risk,
  className,
  showDot = true,
}: {
  risk: RiskLevel
  className?: string
  showDot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide',
        STYLES[risk],
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            DOT[risk],
            risk === 'CRITICAL' && 'animate-pulse-ring',
          )}
        />
      )}
      {risk}
    </span>
  )
}
