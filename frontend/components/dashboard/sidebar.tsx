'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  Siren,
  MessageSquareWarning,
  Link2,
  Smartphone,
  FileText,
  ImageIcon,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { section: 'Overview', items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }, { href: '/threats', label: 'Threats', icon: Siren }] },
  {
    section: 'Analyzers',
    items: [
      { href: '/messages', label: 'Messages', icon: MessageSquareWarning },
      { href: '/urls', label: 'URLs', icon: Link2 },
      { href: '/apk', label: 'APK Analysis', icon: Smartphone },
      { href: '/pdf', label: 'PDF Analysis', icon: FileText },
      { href: '/images', label: 'Image Analysis', icon: ImageIcon },
    ],
  },
  { section: 'System', items: [{ href: '/analytics', label: 'Analytics', icon: BarChart3 }, { href: '/settings', label: 'Settings', icon: Settings }] },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 rounded-r-3xl px-4 py-6 lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2">
        <span className="glow-primary flex size-10 items-center justify-center rounded-xl bg-primary/15">
          <ShieldCheck className="size-5 text-primary" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-sm font-semibold tracking-tight">WhatsApp Suraksha</span>
          <span className="text-[11px] text-muted-foreground">Fraud Intelligence</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              {group.section}
            </span>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/15 text-primary glow-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="glass-strong flex items-center gap-3 rounded-2xl p-3">
        <span className="relative flex size-2.5 items-center justify-center">
          <span className="absolute size-2.5 rounded-full bg-primary/50 animate-pulse-ring" />
          <span className="size-2 rounded-full bg-primary" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium">System Online</span>
          <span className="text-[11px] text-muted-foreground">Engine v1.0 · rules active</span>
        </div>
      </div>
    </aside>
  )
}
