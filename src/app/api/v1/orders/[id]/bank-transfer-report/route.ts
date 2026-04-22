import { NextRequest, NextResponse } from 'next/server'
import { parseUserToken } from '@/lib/auth'
import { storefrontRequest } from '@/lib/backend'
import { sanitizeReportInput } from '@/lib/bankReports'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

function getEmail(req: NextRequest): string | null {
  const token = req.cookies.get('user_token')?.value
  if (!token) return null
  const payload = parseUserToken(token)
  return payload?.id ?? null
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const email = getEmail(req)
  if (!email) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
      { status: 401 },
    )
  }

  const result = await storefrontRequest<{
    id: string
    bankTransferReport?: {
      last5: string
      transferredAt: string | null
      note: string | null
      reportedAt: string
    } | null
  }>(`/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(email)}`)

  if (result.error) {
    const status = result.error.code === 'NOT_FOUND' || result.error.code === 'ORDER_NOT_FOUND' ? 404 : 502
    return NextResponse.json({ data: null, error: result.error }, { status })
  }

  const report = result.data?.bankTransferReport ?? null
  return NextResponse.json({
    data: report ? { orderId: id, ...report } : null,
    error: null,
  })
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const email = getEmail(req)
  if (!email) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
      { status: 401 },
    )
  }

  const raw: unknown = await req.json().catch(() => null)
  const input = sanitizeReportInput(raw)
  if (!input) {
    return NextResponse.json(
      {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: '請輸入正確的匯款末五碼（5 位數字）' },
      },
      { status: 400 },
    )
  }

  const result = await storefrontRequest<{
    bankTransferReport?: {
      last5: string
      transferredAt: string | null
      note: string | null
      reportedAt: string
    } | null
  }>(`/orders/${encodeURIComponent(id)}/bank-transfer-report`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      last5: input.last5,
      transferredAt: input.transferredAt,
      note: input.note,
    }),
  })

  if (result.error) {
    const status =
      result.error.code === 'FORBIDDEN'
        ? 403
        : result.error.code === 'ORDER_NOT_FOUND'
          ? 404
          : result.error.code === 'VALIDATION_ERROR'
            ? 400
            : 502
    return NextResponse.json({ data: null, error: result.error }, { status })
  }

  const report = result.data?.bankTransferReport ?? null
  return NextResponse.json({
    data: report ? { orderId: id, ...report } : null,
    error: null,
  })
}
