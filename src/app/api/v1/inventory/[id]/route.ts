import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'

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

const updateInventorySchema = z.object({
  quantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  sku: z.string().min(1).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body: unknown = await req.json()
    const result = updateInventorySchema.safeParse(body)
    if (!result.success) throw new ValidationError(result.error.message)

    const existing = await prisma.inventory.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('庫存')

    const inventory = await prisma.inventory.update({
      where: { id },
      data: result.data,
      include: {
        product: { select: { id: true, name: true, status: true } },
      },
    })

    return ok(inventory)
  } catch (e) {
    return fail(e)
  }
}
