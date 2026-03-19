import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError, InsufficientStockError } from '@/lib/errors'

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

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().min(1),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1),
  paymentMethod: z.enum(['bank_transfer', 'seller_ship']),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      note,
      items,
    } = result.data

    const order = await prisma.$transaction(async (tx) => {
      // 取得或建立顧客
      let customer = await tx.customer.findUnique({ where: { email: customerEmail } })
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
          },
        })
      }

      // 驗證商品存在並計算總額，同時扣庫存
      let totalAmount = 0
      const orderItemsData: { productId: string; quantity: number; priceAtOrder: number }[] = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true },
        })

        if (!product) throw new NotFoundError(`商品 ${item.productId}`)
        if (product.status !== 'active') {
          throw new AppError(`商品 ${item.productId} 已下架`, 'PRODUCT_INACTIVE', 422)
        }

        const inventory = product.inventory
        if (!inventory || inventory.quantity < item.quantity) {
          throw new InsufficientStockError(item.productId)
        }

        // 扣庫存
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        })

        totalAmount += product.price * item.quantity
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.price,
        })
      }

      // 建立訂單
      return tx.order.create({
        data: {
          customerId: customer.id,
          paymentMethod,
          totalAmount,
          note,
          items: { create: orderItemsData },
        },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      })
    })

    return ok(order, 201)
  } catch (e) {
    return fail(e)
  }
}
