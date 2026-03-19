import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'

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

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: { select: { products: { where: { status: 'active' } } } },
      },
      orderBy: { name: 'asc' },
    })

    return ok(categories)
  } catch (e) {
    return fail(e)
  }
}
