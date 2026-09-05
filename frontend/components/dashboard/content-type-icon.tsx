import { MessageSquareWarning, Link2, Smartphone, FileText, ImageIcon } from 'lucide-react'
import type { ContentType } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const MAP = {
  TEXT: { icon: MessageSquareWarning, label: 'Text' },
  URL: { icon: Link2, label: 'URL' },
  APK: { icon: Smartphone, label: 'APK' },
  PDF: { icon: FileText, label: 'PDF' },
  IMAGE: { icon: ImageIcon, label: 'Image' },
} as const

export function ContentTypeIcon({ type, className }: { type: ContentType; className?: string }) {
  const Icon = MAP[type].icon
  return <Icon className={cn('size-4', className)} />
}

export function ContentTypeTag({ type }: { type: ContentType }) {
  const { icon: Icon, label } = MAP[type]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
