import { Shell } from '@/components/dashboard/shell'
import { TryFraudShield } from '@/components/dashboard/try-fraudshield'
import { RecentThreats } from '@/components/dashboard/recent-threats'
import { THREATS } from '@/lib/sample-data'

export default function UrlsPage() {
  const urlThreats = THREATS.filter((t) => t.contentType === 'URL')
  return (
    <Shell title="URL Intelligence" subtitle="Lookalike, typosquatting and reputation checks">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TryFraudShield />
        <RecentThreats threats={urlThreats} title="Recent URL Threats" showViewAll={false} />
      </div>
    </Shell>
  )
}
