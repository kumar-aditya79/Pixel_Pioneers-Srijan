import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <TopNav title={title} subtitle={subtitle} />
          {children}
        </div>
      </div>
    </div>
  )
}
