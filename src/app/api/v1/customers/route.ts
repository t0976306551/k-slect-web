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
    const search = searchParams.get('search') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const tag = searchParams.get('tag') ?? undefined
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const where = {
      ...(status ? { status } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: { _count: { select: { orders: true } } },
      }),
      prisma.customer.count({ where }),
    ])

    return ok({ customers, total })
  } catch (e) {
    return fail(e)
  }
}
