import { NextRequest, NextResponse } from 'next/server'

// MUST-HAVE: Proxy to the FastAPI backend to avoid CORS issues.
// Change this env var in .env.local when deploying.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()

    // Forward the FormData directly to FastAPI
    const backendRes = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      body: body,
    })

    if (!backendRes.ok) {
      const errText = await backendRes.text()
      return NextResponse.json(
        { error: `Backend error: ${errText}` },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to reach backend: ${msg}` },
      { status: 500 }
    )
  }
}
