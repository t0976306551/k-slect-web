import { NextRequest, NextResponse } from 'next/server'
import { storefrontRequest, backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('categoryId')) params.set('categoryId', searchParams.get('categoryId')!)
  if (searchParams.get('q')) params.set('q', searchParams.get('q')!)
  if (searchParams.get('status')) params.set('status', searchParams.get('status')!)
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!)

  const qs = params.toString()
  const result = await storefrontRequest(`/products${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const body = await req.json()
  // 管理操作：需要 service token
  const result = await backendRequest('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(result, { status: result.error ? (result.error.code === 'VALIDATION_ERROR' ? 400 : 500) : 201 })
}
