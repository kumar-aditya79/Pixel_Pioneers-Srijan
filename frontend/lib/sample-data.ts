import type { RiskLevel } from './fraud-engine'

export type ContentType = 'TEXT' | 'URL' | 'APK' | 'PDF' | 'IMAGE'

export interface ThreatRecord {
  id: string
  time: string
  contentType: ContentType
  detected: string
  fraudType: string
  risk: RiskLevel
  confidence: number
  status: 'Detected' | 'Reviewing' | 'Cleared'
  evidence: string[]
  recommendation: string[]
  raw?: string
}

export const STATS = {
  totalScanned: 1248,
  fraudDetected: 436,
  highRisk: 189,
  critical: 67,
}

export const FRAUD_TYPES: { label: string; value: number; token: string }[] = [
  { label: 'Phishing', value: 42, token: 'chart-1' },
  { label: 'Fake KYC', value: 25, token: 'chart-2' },
  { label: 'Malicious APK', value: 18, token: 'chart-3' },
  { label: 'Payment Scam', value: 15, token: 'chart-4' },
]

export const RISK_DISTRIBUTION: { label: RiskLevel; value: number; token: string }[] = [
  { label: 'LOW', value: 38, token: 'risk-low' },
  { label: 'MEDIUM', value: 24, token: 'risk-medium' },
  { label: 'HIGH', value: 23, token: 'risk-high' },
  { label: 'CRITICAL', value: 15, token: 'risk-critical' },
]

export const THREATS: ThreatRecord[] = [
  {
    id: 'thr-1042',
    time: '10:42',
    contentType: 'URL',
    detected: 'Fake SBI KYC',
    fraudType: 'Fake KYC / Phishing',
    risk: 'HIGH',
    confidence: 92,
    status: 'Detected',
    raw: 'SBI ALERT: Your account will be blocked in 24 hours. Complete KYC now: https://sbi-verify-kyc.info/login',
    evidence: [
      'Domain imitates SBI but is not the official SBI domain',
      'Suspicious top-level domain ".info"',
      'Credential-related path "login"',
      'Urgency: account will be blocked in 24 hours',
      'Reputation warning from threat feed',
    ],
    recommendation: [
      "Don't click the link",
      "Don't share OTP or PIN",
      'Verify through the official SBI YONO app',
      'Report and delete the message',
    ],
  },
  {
    id: 'thr-1039',
    time: '10:39',
    contentType: 'APK',
    detected: 'WeddingInvitation.apk',
    fraudType: 'Malicious APK',
    risk: 'CRITICAL',
    confidence: 96,
    status: 'Detected',
    evidence: [
      'Requests READ_SMS — can intercept OTPs',
      'Requests READ_CONTACTS — harvests contact list',
      'Requests BIND_ACCESSIBILITY_SERVICE — can control the screen',
      'Requests SYSTEM_ALERT_WINDOW — can draw fake overlays',
      'Permissions unnecessary for an invitation viewer',
    ],
    recommendation: [
      "Don't install this file",
      'Delete it immediately',
      'Never enable accessibility for unknown apps',
      'Install apps only from the official Play Store',
    ],
  },
  {
    id: 'thr-1031',
    time: '10:31',
    contentType: 'PDF',
    detected: 'Subsidy_Form.pdf',
    fraudType: 'Payment Scam',
    risk: 'HIGH',
    confidence: 88,
    status: 'Detected',
    raw: 'Your government subsidy has been approved. Pay ₹999 within 2 hours to release the amount.',
    evidence: [
      'Government impersonation',
      'Payment request of ₹999',
      'Urgency: within 2 hours',
      'Genuine subsidies never require an upfront fee',
    ],
    recommendation: [
      "Don't make any payment",
      'Verify on the official government portal',
      'Report and delete the document',
    ],
  },
  {
    id: 'thr-1025',
    time: '10:25',
    contentType: 'TEXT',
    detected: 'Lottery Winner',
    fraudType: 'Lottery / Prize Scam',
    risk: 'MEDIUM',
    confidence: 74,
    status: 'Reviewing',
    raw: 'Congratulations! You have won ₹25,00,000 in the KBC lucky draw. Pay a small processing fee to claim.',
    evidence: [
      'Prize / lottery bait',
      'Payment request (processing fee)',
      'You did not enter any lottery',
    ],
    recommendation: [
      "Don't pay any fee",
      'Legitimate lotteries never charge to release winnings',
      'Report and delete the message',
    ],
  },
  {
    id: 'thr-1018',
    time: '10:18',
    contentType: 'IMAGE',
    detected: 'Bank Screenshot',
    fraudType: 'Fake KYC / Phishing',
    risk: 'HIGH',
    confidence: 90,
    status: 'Detected',
    raw: 'SBI ALERT — Your KYC expires today. Enter OTP to continue.',
    evidence: [
      'OCR extracted SBI impersonation',
      'Urgency: KYC expires today',
      'Sensitive info request: OTP',
    ],
    recommendation: [
      "Don't share OTP with anyone",
      'Banks never ask for OTP over chat',
      'Report and delete the screenshot',
    ],
  },
  {
    id: 'thr-1004',
    time: '10:04',
    contentType: 'TEXT',
    detected: 'Delivery reschedule',
    fraudType: 'Impersonation',
    risk: 'MEDIUM',
    confidence: 68,
    status: 'Detected',
    raw: 'India Post: your parcel is on hold. Update your address and pay ₹25 redelivery fee: indiapost-redeliver.top',
    evidence: [
      'Impersonates India Post',
      'Suspicious domain ".top"',
      'Small payment request (₹25)',
    ],
    recommendation: [
      "Don't click the link",
      "Don't pay the fee",
      'Track parcels only on the official India Post site',
    ],
  },
  {
    id: 'thr-0952',
    time: '09:52',
    contentType: 'TEXT',
    detected: 'Team meeting note',
    fraudType: 'No Fraud Indicators',
    risk: 'LOW',
    confidence: 12,
    status: 'Cleared',
    raw: 'Hi team, reminder that our sprint review is tomorrow at 3pm. Please update your tickets before then.',
    evidence: ['No recognizable fraud patterns detected'],
    recommendation: ['No action needed'],
  },
]

export interface LiveEvent {
  contentType: ContentType
  detected: string
  risk: RiskLevel
}
