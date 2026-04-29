import { NextRequest, NextResponse } from 'next/server'
import { backendRequest, storefrontRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  // 顧客以 email 查看自己的訂單 → 走 storefront 端點
  if (email) {
    const result = await storefrontRequest(`/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(email)}`)
    const status = result.error?.code === 'NOT_FOUND' || result.error?.code === 'ORDER_NOT_FOUND'
      ? 404
      : result.error?.code === 'FORBIDDEN' ? 403
      : result.error ? 500
      : 200
    return NextResponse.json(result, { status })
  }

  // Admin 查看 → 要求管理員權限
  const authError = requireAdmin(req)
  if (authError) return authError

  const result = await backendRequest(`/orders/${id}`)
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
