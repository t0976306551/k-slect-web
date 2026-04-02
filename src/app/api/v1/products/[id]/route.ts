import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'
import { isCuid } from '@/lib/slug'

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

const optionValueInputSchema = z.object({
  value: z.string().min(1),
  position: z.number().int().min(0),
})

const optionInputSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().min(0),
  values: z.array(optionValueInputSchema).min(1),
})

const variantInputSchema = z.object({
  sku: z.string().min(1),
  price: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  status: z.enum(['active', 'inactive']).default('active'),
  image: z.string().nullable().optional(),
  optionValues: z.array(z.string()),
})

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categoryId: z.string().min(1).optional(),
  options: z.array(optionInputSchema).optional(),
  variants: z.array(variantInputSchema).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    // 支援 slug 查詢（非 cuid 格式視為 slug）
    const where = isCuid(id) ? { id } : { slug: id }
    const product = await prisma.product.findUnique({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        options: {
          orderBy: { position: 'asc' },
          include: { values: { orderBy: { position: 'asc' } } },
        },
        variants: {
          where: { status: 'active' },
          include: {
            variantOptions: {
              include: { optionValue: true },
            },
          },
        },
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

    const { options, variants, ...productData } = result.data

    // 有 variants：全刪後重建策略
    if (options?.length && variants?.length) {
      const product = await prisma.$transaction(async tx => {
        // 1. 更新商品基本欄位
        await tx.product.update({ where: { id }, data: productData })

        // 2. 刪除舊 options（cascade 到 values、variantOptions）+ 舊 variants
        await tx.productVariant.deleteMany({ where: { productId: id } })
        await tx.productOption.deleteMany({ where: { productId: id } })

        // 3. 重建 options + values
        const valueMap = new Map<string, string>()
        for (const option of options) {
          const o = await tx.productOption.create({
            data: { productId: id, name: option.name, position: option.position },
          })
          for (const val of option.values) {
            const v = await tx.productOptionValue.create({
              data: { optionId: o.id, value: val.value, position: val.position },
            })
            valueMap.set(val.value, v.id)
          }
        }

        // 4. 重建 variants + variantOptions
        for (const variant of variants) {
          const v = await tx.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              price: variant.price ?? null,
              quantity: variant.quantity,
              lowStockThreshold: variant.lowStockThreshold,
              status: variant.status,
              image: variant.image ?? null,
            },
          })
          for (const valStr of variant.optionValues) {
            const optionValueId = valueMap.get(valStr)
            if (optionValueId) {
              await tx.productVariantOption.create({
                data: { variantId: v.id, optionValueId },
              })
            }
          }
        }

        return tx.product.findUniqueOrThrow({
          where: { id },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            inventory: true,
            options: {
              orderBy: { position: 'asc' },
              include: { values: { orderBy: { position: 'asc' } } },
            },
            variants: {
              include: { variantOptions: { include: { optionValue: true } } },
            },
          },
        })
      })

      return ok(product)
    }

    // 無 variants：一般更新
    const product = await prisma.product.update({
      where: { id },
      data: productData,
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
