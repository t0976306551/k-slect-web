'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ShoppingBag, Check, Star } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProduct } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/api'
import type { ProductVariant } from '@/types'

function findVariant(
  variants: ProductVariant[],
  selectedValues: Record<string, string>, // { optionId: valueId }
): ProductVariant | undefined {
  const entries = Object.entries(selectedValues)
  if (entries.length === 0) return undefined
  return variants.find((v) =>
    entries.every(([, valueId]) =>
      v.variantOptions.some((vo) => vo.optionValueId === valueId)
    )
  )
}

export default function ProductDetailClient() {
  const params = useParams<{ slug: string }>()
  const id = params?.slug ?? ''
  const router = useRouter()
  const [product, setProduct] = useState<ProductWithMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  // { optionId: valueId }
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProduct(id)
        if (res.error) {
          setError(res.error.message)
        } else {
          setProduct(res.data)
          setSelectedValues({})
        }
      } catch {
        setError('載入商品失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const hasVariants = (product?.variants?.length ?? 0) > 0
  const selectedVariant = hasVariants && product?.variants
    ? findVariant(product.variants, selectedValues)
    : undefined

  const allOptionsSelected = hasVariants
    ? (product?.options?.length ?? 0) === Object.keys(selectedValues).length
    : true

  // 庫存判斷：有型號用 variant，否則用 inventory
  const inStock = hasVariants
    ? (selectedVariant?.quantity ?? 0) > 0
    : (product?.inventory?.quantity ?? 0) > 0
  const isActive = product?.status === 'active'

  // 顯示價格：選中型號有獨立定價時顯示型號價
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0

  function handleSelectValue(optionId: string, valueId: string) {
    setSelectedValues((prev) => ({ ...prev, [optionId]: valueId }))
  }

  function isValueOutOfStock(optionId: string, valueId: string): boolean {
    if (!product?.variants) return false
    const tentative = { ...selectedValues, [optionId]: valueId }
    const entries = Object.entries(tentative)
    const matched = product.variants.filter((v) =>
      entries.every(([, vid]) =>
        v.variantOptions.some((vo) => vo.optionValueId === vid)
      )
    )
    return matched.length > 0 && matched.every((v) => v.quantity === 0)
  }

  function handleAddToCart() {
    if (!product) return
    if (hasVariants && !selectedVariant) return

    const variantLabel = selectedVariant
      ? product.options
          ?.map((opt) => {
            const valueId = selectedValues[opt.id]
            return opt.values.find((v) => v.id === valueId)?.value ?? ''
          })
          .filter(Boolean)
          .join(' / ')
      : undefined

    addToCart({
      productId: product.id,
      productName: product.name,
      price: displayPrice,
      image: selectedVariant?.image ?? product.image,
      slug: product.slug ?? undefined,
      variantId: selectedVariant?.id,
      variantLabel,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-[#6B6B6B] text-[14px]">{error ?? '商品不存在'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[13px] text-[#7C9070] hover:underline"
        >
          返回上一頁
        </button>
      </div>
    )
  }

  const displayImage = selectedVariant?.image ?? product.image

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Mobile back button */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-[#F0EFEC]">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-[#6B6B6B]">
          <ChevronLeft size={20} />
          <span className="text-[14px]">返回</span>
        </button>
      </div>

      {/* Desktop breadcrumb */}
      <nav className="hidden md:flex items-center gap-2 text-[13px] text-[#8E8E93] px-12 py-4">
        <Link href="/" className="hover:text-[#7C9070] transition-colors">首頁</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#7C9070] transition-colors">所有商品</Link>
        <span>/</span>
        <span className="text-[#2D2D2D] line-clamp-1">{product.name}</span>
      </nav>

      <div className="md:px-12 md:pb-12 grid grid-cols-1 md:grid-cols-2 md:gap-10">
        {/* Product image */}
        <div className="w-full md:aspect-square md:rounded-[16px] overflow-hidden bg-[#F0EFEC]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-[280px] md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-[280px] md:h-full flex items-center justify-center"><ShoppingBag size={80} className="text-[#C8C8C8]" /></div>
          )}
        </div>

        {/* Product info */}
        <div className="px-4 md:px-0 py-4 md:py-0 flex flex-col gap-3 md:gap-4 md:justify-center">
          {product.category && (
            <span className="inline-block bg-[#EBF1E8] text-[#7C9070] text-[11px] px-3 py-1 rounded-full self-start">
              {product.category.name}
            </span>
          )}
          <h1 className="font-jakarta text-[20px] md:text-[26px] font-bold text-[#2D2D2D] leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <p className="font-jakarta text-[24px] md:text-[30px] font-bold text-[#7C9070]">
              NT$ {displayPrice.toLocaleString('zh-TW')}
            </p>
            {product.originalPrice && (
              <p className="font-jakarta text-[15px] text-[#8E8E93] line-through">
                NT$ {product.originalPrice.toLocaleString('zh-TW')}
              </p>
            )}
          </div>

          {product.rating && (
            <p className="text-[13px] text-[#8E8E93]">
              <Star size={13} className="inline text-[#FFAB30] fill-[#FFAB30] mr-0.5 align-middle" /> {product.rating} · 已售 {product.soldCount?.toLocaleString('zh-TW')} 件
            </p>
          )}

          {/* 型號選擇器（有 variants 才顯示） */}
          {hasVariants && product.options && product.options.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#F0EFEC] pt-3">
              {product.options.map((option) => (
                <div key={option.id}>
                  <p className="text-[12px] font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">
                    {option.name}
                    {selectedValues[option.id] && (
                      <span className="ml-2 text-[#2D2D2D] normal-case font-normal">
                        {option.values.find((v) => v.id === selectedValues[option.id])?.value}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedValues[option.id] === val.id
                      const outOfStock = isValueOutOfStock(option.id, val.id)
                      return (
                        <button
                          key={val.id}
                          onClick={() => handleSelectValue(option.id, val.id)}
                          disabled={outOfStock}
                          className={[
                            'px-3 py-1.5 rounded-[8px] text-[13px] border transition-colors',
                            isSelected
                              ? 'border-[#7C9070] bg-[#EBF1E8] text-[#7C9070] font-semibold'
                              : outOfStock
                              ? 'border-[#E8E8E8] text-[#C0C0C0] line-through cursor-not-allowed'
                              : 'border-[#E8E8E8] text-[#2D2D2D] hover:border-[#7C9070]',
                          ].join(' ')}
                        >
                          {val.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 無型號商品庫存顯示 */}
          {!hasVariants && product.inventory && (
            <p className="text-[13px] text-[#8E8E93]">
              庫存：
              <span className={inStock ? 'text-[#7C9070] font-semibold' : 'text-[#D4845E] font-semibold'}>
                {inStock ? `${product.inventory.quantity} 件` : '已售完'}
              </span>
            </p>
          )}

          {/* 選中型號庫存顯示 */}
          {hasVariants && selectedVariant && (
            <p className="text-[13px] text-[#8E8E93]">
              庫存：
              <span className={inStock ? 'text-[#7C9070] font-semibold' : 'text-[#D4845E] font-semibold'}>
                {inStock ? `${selectedVariant.quantity} 件` : '已售完'}
              </span>
            </p>
          )}

          {product.description && (
            <div className="border-t border-[#F0EFEC] pt-3 md:pt-4">
              <h2 className="text-[12px] font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">商品說明</h2>
              <p className="text-[#6B6B6B] text-[14px] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!isActive || (hasVariants ? (!allOptionsSelected || !inStock) : !inStock)}
            className="w-full flex items-center justify-center gap-2 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] py-3.5 rounded-[10px] transition-colors mt-1"
          >
            {added ? (
              <><Check size={16} /> 已加入購物車</>
            ) : !isActive ? (
              '已下架'
            ) : hasVariants && !allOptionsSelected ? (
              '請選擇型號'
            ) : !inStock ? (
              '已售完'
            ) : (
              <><ShoppingBag size={16} /> 加入購物車</>
            )}
          </button>

          <Link
            href="/cart"
            className="block text-center text-[13px] text-[#7C9070] hover:underline"
          >
            查看購物車
          </Link>
        </div>
      </div>
    </div>
  )
}
