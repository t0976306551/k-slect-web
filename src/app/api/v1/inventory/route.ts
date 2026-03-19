import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null }, { status })
}

function fail(e: unknown): NextResponse<ApiError> {
  if (e instanceof AppError) {
    return NextResponse.json(
      { data: null, error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    )
  }
  console.error('[API Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lowStock = searchParams.get('lowStock') === 'true'

    const all = await prisma.inventory.findMany({
      include: {
        product: { select: { id: true, name: true, status: true } },
      },
      orderBy: { quantity: 'asc' },
    })

    const inventories = lowStock ? all.filter((i) => i.quantity <= i.lowStockThreshold) : all

    return ok(inventories)
  } catch (e) {
    return fail(e)
  }
}
