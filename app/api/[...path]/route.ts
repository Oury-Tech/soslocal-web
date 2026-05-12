import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000/api/v1'

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const targetUrl = `${API_URL}/${path.join('/')}${req.nextUrl.search}`

  try {
    // Construire les headers
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      // Skip headers internes Next.js
      if (!['host', 'connection', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })

    // Body
    let body: BodyInit | undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await req.json())
      } else if (contentType.includes('multipart/form-data')) {
        body = await req.formData()
      } else {
        body = await req.text()
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    })

    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
