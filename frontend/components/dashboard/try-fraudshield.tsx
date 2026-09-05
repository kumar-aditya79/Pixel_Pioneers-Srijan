'use client'

import { useState } from 'react'
import { Radar, Loader2, Trash2, Volume2 } from 'lucide-react'
import { analyzeContent, type FraudReport } from '@/lib/fraud-engine'
import { analyzeWithBackend } from '@/lib/api-engine'
import { ReportCard } from './report-card'

const SAMPLES: { label: string; text: string }[] = [
  {
    label: 'Fake KYC',
    text: 'SBI ALERT — Your account will be blocked in 24 hours. Complete KYC immediately. Click here: sbi-verify-kyc.info',
  },
  {
    label: 'Lottery scam',
    text: 'Congratulations! You have won ₹25,00,000 in the KBC lucky draw. Pay a small processing fee of ₹999 to claim your prize now.',
  },
  {
    label: 'Remote access',
    text: 'To fix your blocked account, install AnyDesk and enable accessibility so our agent can verify your details.',
  },
  {
    label: 'Safe message',
    text: 'Hi, are we still meeting for coffee tomorrow at 5pm near the office?',
  },
]

type ExtendedReport = FraudReport & {
  audioUrlEn?: string
  audioUrlHi?: string
  gaugeImageUrl?: string
}

export function TryFraudShield() {
  const [value, setValue] = useState('')
  const [report, setReport] = useState<ExtendedReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [usingBackend, setUsingBackend] = useState(false)

  async function run(text: string) {
    if (!text.trim()) return
    setLoading(true)
    setUsingBackend(false)

    try {
      // Try the real backend first
      const result = await analyzeWithBackend(text)
      setReport(result)
      setUsingBackend(true)
    } catch {
      // Fallback to local engine if backend is offline
      console.warn('Backend unavailable, using local engine.')
      setTimeout(() => {
        setReport(analyzeContent(text))
        setLoading(false)
      }, 450)
      return
    }

    setLoading(false)
  }

  function reset() {
    setValue('')
    setReport(null)
    setUsingBackend(false)
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

  return (
    <div className="glass animate-rise flex flex-col rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="glow-primary flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Radar className="size-4 text-primary" />
          </span>
          <div>
            <h2 className="font-medium">Try FraudShield</h2>
            <p className="text-xs text-muted-foreground">
              {usingBackend ? '🟢 AI Backend Active' : 'Paste a message or link — live risk engine'}
            </p>
          </div>
        </div>
        {report && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => {
              setValue(s.text)
              run(s.text)
            }}
            className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-strong flex flex-col gap-3 rounded-2xl p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
              e.preventDefault()
              run(value)
            }
          }}
          rows={3}
          placeholder="e.g. Your account will be blocked. Verify at http://secure-bank-update.xyz/login"
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          aria-label="Content to analyze"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">⌘/Ctrl + Enter</span>
          <button
            onClick={() => run(value)}
            disabled={loading || !value.trim()}
            className="glow-primary inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-4 flex flex-col gap-3">
          <ReportCard report={report} />

          {/* Audio Voice Notes from AI backend */}
          {(report.audioUrlEn || report.audioUrlHi) && (
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Volume2 className="size-3.5" />
                Voice Report (AI Generated)
              </div>
              <div className="flex flex-col gap-2">
                {report.audioUrlEn && (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">English 🇬🇧</p>
                    <audio controls src={`${backendUrl}${report.audioUrlEn}`} className="w-full h-8" />
                  </div>
                )}
                {report.audioUrlHi && (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Hindi 🇮🇳</p>
                    <audio controls src={`${backendUrl}${report.audioUrlHi}`} className="w-full h-8" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
