import { Shell } from '@/components/dashboard/shell'
import { TryFraudShield } from '@/components/dashboard/try-fraudshield'
import { RecentThreats } from '@/components/dashboard/recent-threats'
import { THREATS } from '@/lib/sample-data'

export default function MessagesPage() {
  const textThreats = THREATS.filter((t) => t.contentType === 'TEXT')
  return (
    <Shell title="Message Analyzer" subtitle="Detect social-engineering signals in text">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TryFraudShield />
        <RecentThreats threats={textThreats} title="Recent Text Threats" showViewAll={false} />
      </div>
    </Shell>
  )
}
