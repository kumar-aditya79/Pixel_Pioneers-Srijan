import { ImageIcon, ScanText, QrCode } from 'lucide-react'
import { Shell } from '@/components/dashboard/shell'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { ReportCard } from '@/components/dashboard/report-card'
import { analyzeContent } from '@/lib/fraud-engine'

const EXTRACTED = 'SBI ALERT — Your KYC expires today. Enter OTP to continue: sbi-verify-kyc.info'

export default function ImagesPage() {
  const report = analyzeContent(EXTRACTED)

  return (
    <Shell title="Image Analysis" subtitle="OCR for screenshots, posters and fake notices">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <UploadZone
            icon={ImageIcon}
            accept="PNG / JPG up to 10 MB · OCR + QR detection"
            note="Screenshots are run through OCR to extract text, then analyzed. Live upload requires the backend service."
          />
          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Detected in image</div>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <ScanText className="size-4 text-primary" />
                Text extracted via OCR
              </li>
              <li className="flex items-center gap-3">
                <QrCode className="size-4 text-muted-foreground" />
                No QR code found
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ScanText className="size-3.5" />
              OCR Output · Bank_Screenshot.png
            </div>
            <p className="rounded-2xl bg-black/30 p-4 font-mono text-sm leading-relaxed text-foreground/90">
              {EXTRACTED}
            </p>
          </div>
          <ReportCard report={report} />
        </div>
      </div>
    </Shell>
  )
}
