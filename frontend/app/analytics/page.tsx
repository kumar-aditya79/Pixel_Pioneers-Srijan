import { Shell } from '@/components/dashboard/shell'
import { StatCards } from '@/components/dashboard/stat-cards'
import { FraudTypeChart } from '@/components/dashboard/fraud-type-chart'
import { RiskDistribution } from '@/components/dashboard/risk-distribution'
import { RecentThreats } from '@/components/dashboard/recent-threats'
import { THREATS } from '@/lib/sample-data'

export default function AnalyticsPage() {
  return (
    <Shell title="Analytics" subtitle="Fraud trends across all analyzed content">
      <div className="flex flex-col gap-4">
        <StatCards />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FraudTypeChart />
          <RiskDistribution />
        </div>
        <RecentThreats threats={THREATS} title="All Detections" showViewAll={false} />
      </div>
    </Shell>
  )
}
