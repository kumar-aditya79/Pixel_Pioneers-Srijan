// Deterministic fraud-risk engine.
// Security decisions come from rules/heuristics first — not from an LLM.
// The explanation string is templated from the evidence that was actually found,
// so it never claims signals the analyzers did not detect.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type SignalCategory =
  | 'impersonation'
  | 'urgency'
  | 'threat'
  | 'credential'
  | 'payment'
  | 'instruction'
  | 'url'
  | 'reputation'

export interface Signal {
  label: string
  detail: string
  weight: number
  category: SignalCategory
}

export interface FraudReport {
  input: string
  contentType: 'TEXT' | 'URL' | 'TEXT + URL'
  score: number
  risk: RiskLevel
  fraudType: string
  summary: string
  signals: Signal[]
  explanation: string
  recommendations: string[]
}

const URL_REGEX = /((https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?)/gi

const BRANDS: { name: string; official: string[] }[] = [
  { name: 'SBI', official: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com'] },
  { name: 'HDFC Bank', official: ['hdfcbank.com'] },
  { name: 'ICICI Bank', official: ['icicibank.com'] },
  { name: 'Axis Bank', official: ['axisbank.com'] },
  { name: 'RBI', official: ['rbi.org.in'] },
  { name: 'Income Tax Dept', official: ['incometax.gov.in'] },
  { name: 'Paytm', official: ['paytm.com'] },
  { name: 'PhonePe', official: ['phonepe.com'] },
  { name: 'Amazon', official: ['amazon.in', 'amazon.com'] },
  { name: 'Flipkart', official: ['flipkart.com'] },
  { name: 'India Post', official: ['indiapost.gov.in'] },
]

const URGENCY = [
  'urgent', 'immediately', 'within 24 hours', 'within 2 hours', 'act now',
  'expire', 'expires', 'last chance', 'limited time', 'right now', 'asap',
  'before it', 'today only', '24 hrs', 'final notice',
]
const THREATS = [
  'blocked', 'block', 'suspend', 'suspended', 'legal action', 'police',
  'penalty', 'fine', 'deactivat', 'account closure', 'closed', 'arrest',
  'court', 'terminat',
]
const CREDENTIALS = ['otp', 'pin', 'password', 'cvv', 'card number', 'card details', 'aadhaar', 'aadhar', 'pan card', 'net banking', 'upi pin', 'atm pin']
const PAYMENT = ['pay ', '₹', 'rs.', 'rs ', 'processing fee', 'registration fee', 'transfer money', 'send payment', 'clearance fee', 'deposit', 'gst charge']
const INSTRUCTIONS = ['install', '.apk', 'anydesk', 'teamviewer', 'quicksupport', 'enable accessibility', 'screen share', 'share screen', 'remote', 'disable security', 'allow permission']
const KYC = ['kyc', 'complete your kyc', 'update kyc', 're-kyc', 'verify your account', 'verification pending']
const PRIZE = ['lottery', 'winner', 'you have won', 'prize', 'lucky draw', 'reward', 'claim your', 'congratulations you']

const SUSPICIOUS_TLDS = ['.info', '.xyz', '.top', '.buzz', '.club', '.online', '.click', '.link', '.cn', '.ru', '.tk', '.gq', '.work', '.rest']
const SHORTENERS = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl', 'ow.ly']
const CRED_PATHS = ['verify', 'kyc', 'login', 'signin', 'secure', 'update', 'account', 'confirm', 'validate', 'unlock', 'reactivate']
const PAY_PATHS = ['pay', 'payment', 'refund', 'billing', 'checkout', 'wallet']

function has(text: string, needles: string[]): string | null {
  for (const n of needles) {
    if (text.includes(n)) return n
  }
  return null
}

function levenshtein(a: string, b: string): number {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) m[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost)
    }
  }
  return m[a.length][b.length]
}

function parseUrl(raw: string) {
  let url = raw.trim()
  if (!/^https?:\/\//i.test(url)) url = 'http://' + url
  try {
    const u = new URL(url)
    return {
      host: u.hostname.toLowerCase(),
      path: (u.pathname + u.search).toLowerCase(),
      raw: raw.trim(),
    }
  } catch {
    return null
  }
}

function analyzeUrl(raw: string): Signal[] {
  const signals: Signal[] = []
  const parsed = parseUrl(raw)
  if (!parsed) return signals
  const { host, path } = parsed
  const labelParts = host.split('.')
  const rootDomain = labelParts.slice(-2).join('.')

  // Reputation-style blocklist tokens (stand-in for a threat-intel feed).
  if (['sbi-verify-kyc.info', 'secure-bank-update.xyz', 'kyc-verify.top'].some((b) => host.includes(b))) {
    signals.push({
      label: 'Reputation warning',
      detail: `${host} matches a known malicious pattern in the threat feed`,
      weight: 40,
      category: 'reputation',
    })
  }

  // IP-address URL
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    signals.push({ label: 'IP-address URL', detail: `Uses a raw IP (${host}) instead of a domain name`, weight: 15, category: 'url' })
  }

  // Brand lookalike / typosquatting
  for (const brand of BRANDS) {
    const isOfficial = brand.official.some((d) => host === d || host.endsWith('.' + d))
    if (isOfficial) continue
    const brandKey = brand.name.toLowerCase().replace(/[^a-z]/g, '')
    const hostKey = host.replace(/[^a-z]/g, '')
    const near = brand.official.some((d) => {
      const core = d.split('.')[0]
      return levenshtein(core, labelParts[0] || '') <= 2 && (labelParts[0] || '').length > 2
    })
    if (hostKey.includes(brandKey) || near) {
      signals.push({
        label: 'Brand impersonation',
        detail: `Domain imitates ${brand.name} but is not an official ${brand.name} domain`,
        weight: 20,
        category: 'impersonation',
      })
      break
    }
  }

  // Suspicious TLD
  const badTld = SUSPICIOUS_TLDS.find((t) => host.endsWith(t))
  if (badTld) {
    signals.push({ label: 'Suspicious TLD', detail: `Uncommon top-level domain "${badTld}" often used by scams`, weight: 10, category: 'url' })
  }

  // Shortener
  if (SHORTENERS.some((s) => host.includes(s))) {
    signals.push({ label: 'URL shortener', detail: 'Shortened link hides the true destination', weight: 10, category: 'url' })
  }

  // Excessive subdomains
  if (labelParts.length >= 4) {
    signals.push({ label: 'Excessive subdomains', detail: `${labelParts.length} labels in the hostname is unusual`, weight: 10, category: 'url' })
  }

  // Credential / payment paths
  const credHit = CRED_PATHS.find((p) => path.includes(p)) || (host.includes('verify') || host.includes('kyc') ? 'kyc' : null)
  if (credHit) {
    signals.push({ label: 'Credential-related path', detail: `Link contains "${credHit}", typical of phishing pages`, weight: 15, category: 'credential' })
  }
  const payHit = PAY_PATHS.find((p) => path.includes(p))
  if (payHit) {
    signals.push({ label: 'Payment-related path', detail: `Link routes to a "${payHit}" flow`, weight: 15, category: 'payment' })
  }

  // Encoded characters
  if (/%[0-9a-f]{2}|@/i.test(parsed.raw) && !path.startsWith('/')) {
    signals.push({ label: 'Encoded characters', detail: 'Link uses encoded or deceptive characters', weight: 10, category: 'url' })
  }

  return signals
}

function analyzeText(text: string): Signal[] {
  const signals: Signal[] = []
  const t = text.toLowerCase()

  const brandHit = BRANDS.find((b) => t.includes(b.name.toLowerCase()))
  if (brandHit) {
    signals.push({ label: 'Brand impersonation', detail: `Message references ${brandHit.name}`, weight: 20, category: 'impersonation' })
  }

  const kyc = has(t, KYC)
  if (kyc) signals.push({ label: 'Fake KYC pattern', detail: `Mentions "${kyc.trim()}"`, weight: 15, category: 'impersonation' })

  const urgency = has(t, URGENCY)
  if (urgency) signals.push({ label: 'Urgency', detail: `Creates time pressure ("${urgency.trim()}")`, weight: 10, category: 'urgency' })

  const threat = has(t, THREATS)
  if (threat) signals.push({ label: 'Threat language', detail: `Threatens consequences ("${threat.trim()}")`, weight: 10, category: 'threat' })

  const cred = has(t, CREDENTIALS)
  if (cred) signals.push({ label: 'Sensitive info request', detail: `Asks for ${cred.toUpperCase().trim()}`, weight: 15, category: 'credential' })

  const pay = has(t, PAYMENT)
  if (pay) signals.push({ label: 'Payment request', detail: 'Requests a payment or fee', weight: 15, category: 'payment' })

  const instr = has(t, INSTRUCTIONS)
  if (instr) signals.push({ label: 'Suspicious instruction', detail: `Asks you to ${instr.includes('.apk') || instr === 'install' ? 'install software' : instr}`, weight: 25, category: 'instruction' })

  const prize = has(t, PRIZE)
  if (prize) signals.push({ label: 'Prize / lottery bait', detail: `Promises a reward ("${prize.trim()}")`, weight: 15, category: 'urgency' })

  return signals
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

function classify(signals: Signal[]): string {
  const cats = new Set(signals.map((s) => s.category))
  const has = (c: SignalCategory) => cats.has(c)
  if (has('instruction')) return 'Malicious App / Remote-Access Scam'
  if (signals.some((s) => s.label.includes('Prize'))) return 'Lottery / Prize Scam'
  if (signals.some((s) => s.label.includes('KYC') || s.label === 'Fake KYC pattern')) return 'Fake KYC / Phishing'
  if (has('credential') && has('impersonation')) return 'Phishing'
  if (has('payment')) return 'Payment Scam'
  if (has('impersonation')) return 'Impersonation'
  if (signals.length > 0) return 'Suspicious Message'
  return 'No Fraud Indicators'
}

function buildExplanation(risk: RiskLevel, fraudType: string, signals: Signal[]): string {
  if (signals.length === 0) {
    return 'No known fraud indicators were detected in this content. It appears low risk, but always stay cautious with unexpected messages.'
  }
  const reasons = signals.slice(0, 4).map((s) => s.detail.toLowerCase())
  const list =
    reasons.length === 1
      ? reasons[0]
      : reasons.slice(0, -1).join(', ') + ' and ' + reasons[reasons.length - 1]
  return `This content is ${risk.toLowerCase()} risk and looks like ${fraudType.toLowerCase()} because ${list}.`
}

function buildRecommendations(signals: Signal[], risk: RiskLevel): string[] {
  if (risk === 'LOW') {
    return [
      'No action needed, but never share OTPs or passwords with anyone',
      'If unsure, verify the sender through an official channel',
    ]
  }
  const cats = new Set(signals.map((s) => s.category))
  const recs: string[] = []
  if (cats.has('url')) recs.push("Don't click the link")
  if (cats.has('credential')) recs.push("Don't share OTP, PIN or passwords")
  if (cats.has('payment')) recs.push("Don't make any payment")
  if (cats.has('instruction')) recs.push("Don't install any app or grant remote access")
  recs.push('Verify directly through the official app or website')
  recs.push('Report and delete the message')
  return recs
}

function summarize(fraudType: string, signals: Signal[]): string {
  if (signals.length === 0) return 'This content shows no recognizable fraud patterns.'
  const brand = signals.find((s) => s.category === 'impersonation')
  if (brand) return `This content impersonates a trusted brand and shows patterns of ${fraudType.toLowerCase()}.`
  return `This content shows patterns consistent with ${fraudType.toLowerCase()}.`
}

export function analyzeContent(input: string): FraudReport {
  const text = input.trim()
  const urls = text.match(URL_REGEX)?.filter((u) => u.includes('.') && !/^\d+\.\d+$/.test(u)) ?? []

  const textSignals = analyzeText(text)
  const urlSignals = urls.flatMap((u) => analyzeUrl(u))

  // Merge, de-duplicate by label, keep the highest-weight variant.
  const byLabel = new Map<string, Signal>()
  for (const s of [...urlSignals, ...textSignals]) {
    const existing = byLabel.get(s.label)
    if (!existing || s.weight > existing.weight) byLabel.set(s.label, s)
  }
  const signals = [...byLabel.values()].sort((a, b) => b.weight - a.weight)

  const score = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0))
  const risk = riskFromScore(score)
  const fraudType = classify(signals)

  const hasText = textSignals.length > 0 || (!urls.length && text.length > 0)
  const contentType: FraudReport['contentType'] =
    urls.length && (hasText || text.replace(urls[0], '').trim().length > 4)
      ? 'TEXT + URL'
      : urls.length
        ? 'URL'
        : 'TEXT'

  return {
    input: text,
    contentType,
    score,
    risk,
    fraudType,
    summary: summarize(fraudType, signals),
    signals,
    explanation: buildExplanation(risk, fraudType, signals),
    recommendations: buildRecommendations(signals, risk),
  }
}

export const RISK_META: Record<RiskLevel, { token: string; label: string }> = {
  LOW: { token: 'risk-low', label: 'Low Risk' },
  MEDIUM: { token: 'risk-medium', label: 'Medium Risk' },
  HIGH: { token: 'risk-high', label: 'High Risk' },
  CRITICAL: { token: 'risk-critical', label: 'Critical Risk' },
}
