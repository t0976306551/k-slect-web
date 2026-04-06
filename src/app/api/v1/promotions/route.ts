import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('channel')) params.set('channel', searchParams.get('channel')!)
  if (searchParams.get('status')) params.set('status', searchParams.get('status')!)
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('page')) params.set('page', searchParams.get('page')!)

  const qs = params.toString()
  const result = await backendRequest(`/promotions${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const body = await req.json() as { productIds?: string[]; [key: string]: unknown }
  // k-slect-web Prisma 版用 productIds[]，後台用 ManyToMany
  // 後台的 createPromotion 接受 productIds 並做 connect
  const result = await backendRequest('/promotions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(result, { status: result.error ? 500 : 201 })
}
