import type { LucideIcon } from 'lucide-react'
import { UploadCloud, Info } from 'lucide-react'

export function UploadZone({
  icon: Icon,
  accept,
  note,
}: {
  icon: LucideIcon
  accept: string
  note: string
}) {
  return (
    <div className="glass animate-rise rounded-3xl p-5">
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
        <span className="glow-primary flex size-12 items-center justify-center rounded-2xl bg-primary/15">
          <Icon className="size-6 text-primary" />
        </span>
        <div>
          <p className="text-sm font-medium">Drop a file to analyze</p>
          <p className="text-xs text-muted-foreground">{accept}</p>
        </div>
        <button className="mt-1 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <UploadCloud className="size-4" />
          Choose file
        </button>
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {note}
      </p>
    </div>
  )
}
