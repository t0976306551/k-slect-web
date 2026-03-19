import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'

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

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categoryId: z.string().min(1).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
      },
    })

    if (!product) throw new NotFoundError('商品')
    return ok(product)
  } catch (e) {
    return fail(e)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body: unknown = await req.json()
    const result = updateProductSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('商品')

    const product = await prisma.product.update({
      where: { id },
      data: result.data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
      },
    })

    return ok(product)
  } catch (e) {
    return fail(e)
  }
}
