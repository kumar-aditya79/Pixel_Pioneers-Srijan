import { FileText, ScanLine, Quote } from 'lucide-react'
import { Shell } from '@/components/dashboard/shell'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { ReportCard } from '@/components/dashboard/report-card'
import { analyzeContent } from '@/lib/fraud-engine'

const EXTRACTED =
  'Government of India — Subsidy Disbursement Notice. Your government subsidy of ₹50,000 has been approved. Pay a ₹999 processing fee within 2 hours to release the amount to your account.'

export default function PdfPage() {
  const report = analyzeContent(EXTRACTED)

  return (
    <Shell title="PDF Analysis" subtitle="Text extraction and OCR for scanned documents">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <UploadZone
            icon={FileText}
            accept="PDF files up to 25 MB · text + scanned (OCR)"
            note="Normal PDFs use text extraction; scanned PDFs run through OCR first. Live upload requires the backend service."
          />
          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ScanLine className="size-3.5" />
              OCR Pipeline
            </div>
            <ol className="flex flex-col gap-2 text-sm">
              {['PDF received', 'Scanned page detected', 'OCR text extraction', 'Text analyzer', 'Risk engine'].map(
                (step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="glass animate-rise rounded-3xl p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Quote className="size-3.5" />
              Extracted Text · Subsidy_Form.pdf
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
