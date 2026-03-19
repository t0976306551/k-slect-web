import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null })
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

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'active'

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status },
          include: {
            inventory: { select: { quantity: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!category) throw new NotFoundError('分類')
    return ok(category)
  } catch (e) {
    return fail(e)
  }
}
