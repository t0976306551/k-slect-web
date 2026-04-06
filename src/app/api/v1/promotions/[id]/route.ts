import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/v1/promotions/[id] — 取得單一推廣紀錄 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const result = await backendRequest(`/promotions/${id}`)
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}

/** PATCH /api/v1/promotions/[id] — 更新推廣紀錄狀態 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const result = await backendRequest(`/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}

/** DELETE /api/v1/promotions/[id] — 刪除推廣紀錄 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const result = await backendRequest(`/promotions/${id}`, { method: 'DELETE' })
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
