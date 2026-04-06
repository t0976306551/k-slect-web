/**
 * GET /api/v1/promotions/scheduled
 *
 * 查詢排程中的推廣清單，代理後台 API。
 */

import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!)

  const qs = params.toString()
  const result = await backendRequest(`/promotions/scheduled${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}
