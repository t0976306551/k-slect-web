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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const where = {
      ...(status ? { status } : {}),
      ...(email ? { customer: { email } } : {}),
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          items: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return ok({ orders, total })
  } catch (e) {
    return fail(e)
  }
}

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().min(1),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1),
  paymentMethod: z.enum(['seller_ship', 'bank_transfer']),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        variantId: z.string().min(1).optional(),
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
      const orderItemsData: {
        productId: string
        quantity: number
        priceAtOrder: number
        variantId?: string
        variantSnapshot?: Record<string, string>
      }[] = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            inventory: true,
            variants: { select: { id: true } },
          },
        })

        if (!product) throw new NotFoundError(`商品 ${item.productId}`)
        if (product.status !== 'active') {
          throw new AppError(`商品 ${item.productId} 已下架`, 'PRODUCT_INACTIVE', 422)
        }

        const hasVariants = product.variants.length > 0

        if (hasVariants && !item.variantId) {
          throw new ValidationError(`商品 ${item.productId} 需要選擇型號`)
        }

        if (item.variantId) {
          // 新路徑：透過 ProductVariant 扣庫存
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: {
              variantOptions: {
                include: {
                  optionValue: { include: { option: true } },
                },
              },
            },
          })

          if (!variant || variant.productId !== item.productId) {
            throw new NotFoundError(`型號 ${item.variantId}`)
          }
          if (variant.status !== 'active') {
            throw new AppError(`型號 ${item.variantId} 已下架`, 'VARIANT_INACTIVE', 422)
          }
          if (variant.quantity < item.quantity) {
            throw new InsufficientStockError(item.variantId)
          }

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          })

          // 建立型號快照
          const variantSnapshot: Record<string, string> = {}
          for (const vo of variant.variantOptions) {
            variantSnapshot[vo.optionValue.option.name] = vo.optionValue.value
          }

          const priceAtOrder = variant.price ?? product.price
          totalAmount += priceAtOrder * item.quantity
          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder,
            variantId: item.variantId,
            variantSnapshot,
          })
        } else {
          // 舊路徑：透過 Inventory 扣庫存
          const inventory = product.inventory
          if (!inventory || inventory.quantity < item.quantity) {
            throw new InsufficientStockError(item.productId)
          }

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
