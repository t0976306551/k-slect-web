import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, ValidationError } from '@/lib/errors'

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

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  status: z.enum(['active', 'inactive']).default('active'),
  categoryId: z.string().min(1),
  inventory: z
    .object({
      sku: z.string().min(1),
      quantity: z.number().int().min(0).default(0),
      lowStockThreshold: z.number().int().min(0).default(5),
    })
    .optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') ?? undefined
    const q = searchParams.get('q') ?? undefined
    const status = searchParams.get('status') ?? undefined

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: { select: { sku: true, quantity: true, lowStockThreshold: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok(products)
  } catch (e) {
    return fail(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const result = createProductSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const { inventory, ...productData } = result.data
    const product = await prisma.product.create({
      data: {
        ...productData,
        ...(inventory ? { inventory: { create: inventory } } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
      },
    })

    return ok(product, 201)
  } catch (e) {
    return fail(e)
  }
}
