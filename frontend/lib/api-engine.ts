// Bridge between the Next.js frontend and our FastAPI backend.
// Maps the backend's JSON response to the FraudReport type used in the UI.

import type { FraudReport, Signal, RiskLevel } from './fraud-engine'

interface BackendEvidence {
  analyzer_name?: string
  findings?: string[]
  risk_score?: number
}

interface BackendExplanation {
  summary: string
  fraud_type: string
  risk_level: string
  confidence: string
  evidence: string[]
  recommended_action: string
  explanation: string
}

interface BackendResponse {
  explanation: BackendExplanation
  risk_score: number
  risk_level: string
  audio_url_en?: string
  audio_url_hi?: string
  gauge_image_url?: string
}

function mapRiskLevel(level: string): RiskLevel {
  const l = level.toUpperCase()
  if (l === 'CRITICAL') return 'CRITICAL'
  if (l === 'HIGH') return 'HIGH'
  if (l === 'MEDIUM') return 'MEDIUM'
  return 'LOW'
}

function evidenceToSignals(evidence: string[]): Signal[] {
  return evidence.map((e) => ({
    label: e.length > 50 ? e.slice(0, 50) + '…' : e,
    detail: e,
    weight: 10,
    category: 'reputation' as const,
  }))
}

export async function analyzeWithBackend(
  text: string,
  file?: File
): Promise<FraudReport & { audioUrlEn?: string; audioUrlHi?: string; gaugeImageUrl?: string }> {
  const form = new FormData()
  if (text) form.append('text', text)

  // Extract URL from text if present
  const urlMatch = text.match(/((https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?)/gi)
  if (urlMatch) form.append('url', urlMatch[0])

  if (file) form.append('file', file)

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.statusText}`)
  }

  const data: BackendResponse = await res.json()
  const { explanation, risk_score, risk_level } = data

  const risk = mapRiskLevel(risk_level)
  const signals = evidenceToSignals(explanation.evidence)

  return {
    input: text,
    contentType: file ? 'TEXT + URL' : urlMatch ? 'TEXT + URL' : 'TEXT',
    score: Math.round(risk_score),
    risk,
    fraudType: explanation.fraud_type,
    summary: explanation.summary,
    signals,
    explanation: explanation.explanation,
    recommendations: [
      explanation.recommended_action,
      risk !== 'LOW' ? "Don't share this message further" : 'Stay cautious with unexpected messages',
    ],
    // Extra fields from backend
    audioUrlEn: data.audio_url_en,
    audioUrlHi: data.audio_url_hi,
    gaugeImageUrl: data.gauge_image_url,
  }
}
