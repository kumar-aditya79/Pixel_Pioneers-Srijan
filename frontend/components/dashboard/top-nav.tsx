import { Bell, Search, ShieldCheck } from 'lucide-react'

export function TopNav({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="glow-primary flex size-11 items-center justify-center rounded-2xl bg-primary/15 lg:hidden">
          <ShieldCheck className="size-5 text-primary" />
        </span>
        <div>
          <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          <input
            placeholder="Search threats…"
            className="w-28 bg-transparent outline-none placeholder:text-muted-foreground/70 focus:w-40 transition-all sm:w-36"
            aria-label="Search threats"
          />
        </div>
        <button
          className="glass relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-risk-high" />
        </button>
        <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 font-mono text-xs font-semibold text-primary">
            AD
          </span>
          <span className="hidden text-sm font-medium sm:inline">Admin</span>
        </div>
      </div>
    </header>
  )
}
