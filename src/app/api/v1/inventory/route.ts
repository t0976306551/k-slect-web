import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('lowStock') === 'true') params.set('lowStock', 'true')

  const qs = params.toString()
  const result = await backendRequest(`/inventory${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}
