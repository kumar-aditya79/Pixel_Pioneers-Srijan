import { Shell } from '@/components/dashboard/shell'
import { StatCards } from '@/components/dashboard/stat-cards'
import { FraudTypeChart } from '@/components/dashboard/fraud-type-chart'
import { RiskDistribution } from '@/components/dashboard/risk-distribution'
import { RecentThreats } from '@/components/dashboard/recent-threats'
import { TryFraudShield } from '@/components/dashboard/try-fraudshield'
import { THREATS } from '@/lib/sample-data'

export default function DashboardPage() {
  return (
    <Shell
      title="Fraud Intelligence Center"
      subtitle="Live WhatsApp fraud detection · Forward → Analyze → Understand → Protect"
    >
      <div className="flex flex-col gap-4">
        <StatCards />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FraudTypeChart />
              <RiskDistribution />
            </div>
            <RecentThreats threats={THREATS.slice(0, 6)} />
          </div>

          <div className="xl:col-span-1">
            <TryFraudShield />
          </div>
        </div>
      </div>
    </Shell>
  )
}
