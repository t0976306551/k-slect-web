'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag, Check, PackageX } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProduct } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/api'
import type { ProductVariant } from '@/types'

const ADDED_FEEDBACK_DURATION_MS = 2000

function findVariant(
  variants: ProductVariant[],
  selectedValues: Record<string, string>,
): ProductVariant | undefined {
  const entries = Object.entries(selectedValues)
  if (entries.length === 0) return undefined
  return variants.find((v) =>
    entries.every(([, valueId]) =>
      v.optionValues?.some((ov) => ov.id === valueId)
    )
  )
}

function ImageCarousel({
  images,
  alt,
  current,
  onChange,
}: {
  images: string[]
  alt: string
  current: number
  onChange: (i: number) => void
}) {
  const touchStartX = useRef<number | null>(null)
  const count = images.length

  if (count === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ShoppingBag size={72} className="text-[#D8D5D0]" />
      </div>
    )
  }

  const prev = () => onChange((current - 1 + count) % count)
  const next = () => onChange((current + 1) % count)

  return (
    <>
      {/* Slide track — parent handles overflow:hidden */}
      <div
        className="flex h-full will-change-transform transition-transform duration-[350ms] ease-out"
        style={{ width: `${count * 100}%`, transform: `translateX(-${current * (100 / count)}%)` }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
          touchStartX.current = null
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative h-full flex-shrink-0" style={{ width: `${100 / count}%` }}>
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Desktop prev/next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm items-center justify-center hover:bg-white active:scale-90 transition-all z-10"
            aria-label="上一張"
          >
            <ChevronLeft size={17} className="text-[#2D2D2D]" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm items-center justify-center hover:bg-white active:scale-90 transition-all z-10"
            aria-label="下一張"
          >
            <ChevronRight size={17} className="text-[#2D2D2D]" />
          </button>
        </>
      )}

      {/* Mobile dot indicators */}
      {count > 1 && (
        <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/80'
              }`}
              aria-label={`第 ${i + 1} 張`}
            />
          ))}
        </div>
      )}
    </>
  )
}

function SkeletonDetail() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="md:hidden h-12 bg-white border-b border-[#F0EFEC] animate-pulse" />
      <div className="hidden md:block h-10 mx-12 mt-2 animate-pulse">
        <div className="h-3 w-48 bg-[#F0EFEC] rounded" />
      </div>
      <div className="md:px-12 md:pb-12 grid grid-cols-1 md:grid-cols-2 md:gap-12">
        <div className="w-full aspect-[4/3] md:aspect-square bg-[#F0EFEC] md:rounded-[20px] animate-pulse" />
        <div className="px-4 md:px-0 py-5 md:py-0 flex flex-col gap-4 animate-pulse">
          <div className="h-5 w-20 bg-[#F0EFEC] rounded-full" />
          <div className="space-y-2">
            <div className="h-7 bg-[#F0EFEC] rounded w-4/5" />
            <div className="h-7 bg-[#F0EFEC] rounded w-3/5" />
          </div>
          <div className="h-9 bg-[#F0EFEC] rounded w-1/3" />
          <div className="h-px bg-[#F0EFEC] rounded" />
          <div className="space-y-2">
            <div className="h-3 bg-[#F0EFEC] rounded w-1/4" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-9 w-16 bg-[#F0EFEC] rounded-[8px]" />)}
            </div>
          </div>
          <div className="h-12 bg-[#F0EFEC] rounded-[12px] mt-2" />
        </div>
      </div>
    </div>
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
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})
  const [currentImage, setCurrentImage] = useState(0)

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
          setCurrentImage(0)
        }
      } catch {
        setError('載入商品失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    }
  }, [])

  const hasVariants = (product?.variants?.length ?? 0) > 0
  const selectedVariant = hasVariants && product?.variants
    ? findVariant(product.variants, selectedValues)
    : undefined

  const allOptionsSelected = hasVariants
    ? (product?.options?.length ?? 0) === Object.keys(selectedValues).length
    : true

  const inStock = hasVariants
    ? (selectedVariant?.quantity ?? 0) > 0
    : (product?.inventory?.quantity ?? 0) > 0
  const isActive = product?.status === 'active'
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
        v.optionValues?.some((ov) => ov.id === vid)
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
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => {
      setAdded(false)
      addedTimerRef.current = null
    }, ADDED_FEEDBACK_DURATION_MS)
  }

  const ctaDisabled = !isActive || (hasVariants ? (!allOptionsSelected || !inStock) : !inStock)
  const ctaLabel = added ? null
    : !isActive ? '已下架'
    : hasVariants && !allOptionsSelected ? '請選擇型號'
    : !inStock ? '已售完'
    : null

  if (loading) return <SkeletonDetail />

  if (error || !product) {    return (
      <div className="text-center py-32 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[#F0EFEC] flex items-center justify-center mb-2">
          <PackageX size={24} className="text-[#AEAAA4]" />
        </div>
        <p className="font-jakarta text-[15px] font-semibold text-[#2D2D2D]">
          {error ?? '找不到此商品'}
        </p>
        <p className="font-jakarta text-[13px] text-[#AEAAA4]">商品可能已下架或不存在</p>
        <button
          onClick={() => router.back()}
          className="mt-2 font-jakarta text-[13px] font-semibold text-[#7C9070] border border-[#7C9070] px-5 py-2 rounded-full hover:bg-[#7C9070] hover:text-white transition-colors"
        >
          返回上一頁
        </button>
      </div>
    )
  }

  const displayImage = selectedVariant?.image ?? product.image
  const carouselImages: string[] = product.images?.length
    ? product.images
    : displayImage ? [displayImage] : []
  const discountPct = product.originalPrice && product.originalPrice > displayPrice
    ? Math.round((1 - displayPrice / product.originalPrice) * 100)
    : null

  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      {/* Mobile back bar */}
      <div className="md:hidden flex items-center px-3 py-2.5 bg-white border-b border-[#F0EFEC]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-0.5 text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors p-1 -ml-1"
          aria-label="返回"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
          <span className="font-jakarta text-[14px]">返回</span>
        </button>
      </div>

      {/* Desktop breadcrumb */}
      <nav className="hidden md:flex items-center gap-1.5 text-[12px] text-[#AEAAA4] max-w-[1440px] mx-auto px-12 py-4">
        <Link href="/" className="hover:text-[#7C9070] transition-colors">首頁</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#7C9070] transition-colors">所有商品</Link>
        <span>/</span>
        <span className="text-[#2D2D2D] line-clamp-1">{product.name}</span>
      </nav>

      <div className="max-w-[1440px] mx-auto md:px-12 md:pb-16 pb-[140px]">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12 md:items-start">

          {/* Product image carousel */}
          <div>
            <div className="w-full aspect-[4/3] md:aspect-square md:rounded-[20px] overflow-hidden bg-[#F0EFEC] relative">
              <ImageCarousel
                images={carouselImages}
                alt={product.name}
                current={currentImage}
                onChange={setCurrentImage}
              />
              {discountPct && (
                <div className="absolute top-3 left-3 z-10 bg-[#D4845E] text-white font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  -{discountPct}%
                </div>
              )}
            </div>

            {/* Desktop thumbnail strip */}
            {carouselImages.length > 1 && (
              <div className="hidden md:flex gap-2 mt-3">
                {carouselImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-[72px] h-[72px] rounded-[10px] overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === currentImage
                        ? 'border-[#7C9070] opacity-100'
                        : 'border-transparent opacity-55 hover:opacity-85'
                    }`}
                    aria-label={`第 ${i + 1} 張圖片`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="px-4 md:px-0 py-5 md:py-2 flex flex-col gap-4">

            {/* Category + name */}
            <div className="flex flex-col gap-2">
              {product.category && (
                <span className="font-jakarta text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C9070]">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-fraunces text-[22px] md:text-[28px] font-medium text-[#2D2D2D] leading-[1.25] tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <p className={`font-jakarta text-[26px] md:text-[30px] font-semibold tabular-nums leading-none ${product.originalPrice ? 'text-[#D4845E]' : 'text-[#2D2D2D]'}`}>
                NT$ {displayPrice.toLocaleString('zh-TW')}
              </p>
              {product.originalPrice && (
                <p className="font-jakarta text-[15px] text-[#AEAAA4] line-through tabular-nums leading-none">
                  NT$ {product.originalPrice.toLocaleString('zh-TW')}
                </p>
              )}
            </div>

            {/* Variant options */}
            {hasVariants && product.options && product.options.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-[#F0EFEC] pt-4">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <p className="font-jakarta text-[11px] font-semibold text-[#AEAAA4] mb-2.5 uppercase tracking-[0.08em]">
                      {option.name}
                      {selectedValues[option.id] && (
                        <span className="ml-2 text-[#2D2D2D] normal-case font-normal tracking-normal">
                          · {option.values.find((v) => v.id === selectedValues[option.id])?.value}
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
                              'px-3.5 py-2 rounded-[10px] text-[13px] font-jakarta font-medium border transition-all',
                              isSelected
                                ? 'border-[#7C9070] bg-[#EBF1E8] text-[#7C9070]'
                                : outOfStock
                                ? 'border-[#ECEAE6] text-[#C4C0BA] line-through cursor-not-allowed bg-[#F7F6F3]'
                                : 'border-[#ECEAE6] text-[#2D2D2D] hover:border-[#7C9070] bg-white',
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

            {/* Stock info */}
            <div className="border-t border-[#F0EFEC] pt-3">
              {!hasVariants && product.inventory && (
                <p className="font-jakarta text-[12px] text-[#AEAAA4]">
                  庫存：
                  <span className={`font-semibold ml-1 ${inStock ? 'text-[#7C9070]' : 'text-[#D4845E]'}`}>
                    {inStock ? `${product.inventory.quantity} 件可購` : '已售完'}
                  </span>
                </p>
              )}
              {hasVariants && selectedVariant && (
                <p className="font-jakarta text-[12px] text-[#AEAAA4]">
                  庫存：
                  <span className={`font-semibold ml-1 ${inStock ? 'text-[#7C9070]' : 'text-[#D4845E]'}`}>
                    {inStock ? `${selectedVariant.quantity} 件可購` : '此型號已售完'}
                  </span>
                </p>
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={ctaDisabled}
                className="w-full flex items-center justify-center gap-2 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#F0EFEC] disabled:text-[#AEAAA4] text-white font-jakarta font-semibold text-[15px] py-4 rounded-[12px] transition-colors"
              >
                {added
                  ? <><Check size={16} strokeWidth={2.5} /> 已加入購物車</>
                  : ctaLabel
                  ? ctaLabel
                  : <><ShoppingBag size={16} /> 加入購物車</>
                }
              </button>
              <Link
                href="/cart"
                className="block text-center font-jakarta text-[13px] text-[#7C9070] hover:underline"
              >
                查看購物車
              </Link>
            </div>
          </div>
        </div>

        {/* Full-width description section */}
        {(product.description || (product.descriptionImages?.length ?? 0) > 0) && (
          <section className="mt-10 md:mt-16 px-4 md:px-0 border-t border-[#F0EFEC] pt-8 md:pt-12">
            <h2 className="font-fraunces text-[18px] md:text-[22px] font-medium text-[#2D2D2D] mb-6">
              商品說明
            </h2>
            {product.description && (
              <div className="max-w-[680px] mb-8">
                <p className="font-jakarta text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.9] whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
            {product.descriptionImages && product.descriptionImages.length > 0 && (
              <div className="flex flex-col gap-4 md:gap-6">
                {product.descriptionImages.map((src, i) => (
                  <div key={i} className="rounded-[12px] md:rounded-[16px] overflow-hidden bg-[#F0EFEC]">
                    <Image
                      src={src}
                      alt={`${product.name} 說明圖 ${i + 1}`}
                      width={1200}
                      height={675}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Mobile Sticky CTA — sits above TabBar (h-[54px]) */}
      <div className="md:hidden fixed left-0 right-0 bg-white border-t border-[#F0EFEC] z-40 px-4 py-3" style={{ bottom: 'calc(54px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <p className={`font-jakarta text-[17px] font-semibold tabular-nums leading-tight ${product.originalPrice ? 'text-[#D4845E]' : 'text-[#2D2D2D]'}`}>
              NT$ {displayPrice.toLocaleString('zh-TW')}
            </p>
            {product.originalPrice && (
              <p className="font-jakarta text-[11px] text-[#AEAAA4] line-through tabular-nums leading-tight">
                NT$ {product.originalPrice.toLocaleString('zh-TW')}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={ctaDisabled}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#F0EFEC] disabled:text-[#AEAAA4] text-white font-jakarta font-semibold text-[14px] py-3 rounded-[10px] transition-colors"
          >
            {added
              ? <><Check size={15} strokeWidth={2.5} /> 已加入</>
              : ctaLabel
              ? ctaLabel
              : <><ShoppingBag size={15} /> 加入購物車</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
