import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, ValidationError } from '@/lib/errors'
import { generateSlug } from '@/lib/slug'
import { toProductResponse, toProductListResponse } from '../helpers'

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
  optionValues: z.array(z.string()), // option value 字串（不是 ID）
})

const createProductSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().int().positive(),
    originalPrice: z.number().int().positive().optional(),
    images: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    categoryId: z.string().min(1),
    inventory: z
      .object({
        sku: z.string().min(1),
        quantity: z.number().int().min(0).default(0),
        lowStockThreshold: z.number().int().min(0).default(5),
      })
      .optional(),
    options: z.array(optionInputSchema).optional(),
    variants: z.array(variantInputSchema).optional(),
  })
  .refine(data => !(data.inventory && data.variants?.length), {
    message: 'inventory 與 variants 不可同時存在',
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
      orderBy: { createdAt: 'desc' },
    })

    return ok(toProductListResponse(products))
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

    const { inventory, options, variants, slug: providedSlug, ...productData } = result.data
    const slug = providedSlug ?? generateSlug(productData.name)

    // 有 variants：使用 transaction 建立完整資料
    if (options?.length && variants?.length) {
      const product = await prisma.$transaction(async tx => {
        // 1. 建 Product
        const p = await tx.product.create({ data: { ...productData, slug } })

        // 2. 建 ProductOption + ProductOptionValue，建 value 字串 → ID 的 Map
        const valueMap = new Map<string, string>()
        for (const option of options) {
          const o = await tx.productOption.create({
            data: { productId: p.id, name: option.name, position: option.position },
          })
          for (const val of option.values) {
            const v = await tx.productOptionValue.create({
              data: { optionId: o.id, value: val.value, position: val.position },
            })
            valueMap.set(val.value, v.id)
          }
        }

        // 3. 建 ProductVariant + ProductVariantOption 關聯
        for (const variant of variants) {
          const v = await tx.productVariant.create({
            data: {
              productId: p.id,
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
          where: { id: p.id },
          include: {
            category: { select: { id: true, name: true, slug: true } },
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

      return ok(toProductResponse(product), 201)
    }

    // 無 variants：單一商品建立
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        ...(inventory ? { inventory: { create: inventory } } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
      },
    })

    return ok(toProductResponse(product), 201)
  } catch (e) {
    return fail(e)
  }
}
