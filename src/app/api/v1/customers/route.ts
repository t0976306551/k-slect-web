import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('search')) params.set('search', searchParams.get('search')!)
  if (searchParams.get('status')) params.set('status', searchParams.get('status')!)
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!)

  const qs = params.toString()
  // 後台 /members 回傳 Member[]（含統計），格式與 Customer 不同
  // 這裡直接回傳後台回應，前端自行處理欄位差異
  const result = await backendRequest(`/members${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}
