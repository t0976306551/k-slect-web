import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'

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

const patchCustomerSchema = z
  .object({
    status: z.enum(['active', 'blacklisted', 'vip']),
    tags: z.array(z.string()),
    note: z.string().nullable(),
  })
  .partial()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body: unknown = await req.json()
    const result = patchCustomerSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const existing = await prisma.customer.findUnique({ where: { id: params.id } })
    if (!existing) throw new NotFoundError(`顧客 ${params.id}`)

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: result.data,
      include: { _count: { select: { orders: true } } },
    })

    return ok(customer)
  } catch (e) {
    return fail(e)
  }
}
