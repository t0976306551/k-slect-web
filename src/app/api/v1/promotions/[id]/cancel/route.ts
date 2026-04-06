/**
 * POST /api/v1/promotions/[id]/cancel
 *
 * 取消排程推廣，代理後台 API。
 */

import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const result = await backendRequest(`/promotions/${id}/cancel`, { method: 'POST' })
  const status = result.error?.code === 'NOT_FOUND'
    ? 404
    : result.error?.code === 'CANNOT_CANCEL'
      ? 422
      : result.error
        ? 500
        : 200
  return NextResponse.json(result, { status })
}
