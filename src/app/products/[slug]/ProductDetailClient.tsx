'use client'

import type { ReactElement } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AddToCartButton from './_components/AddToCartButton'
import Breadcrumb from './_components/Breadcrumb'
import ErrorState from './_components/ErrorState'
import MobileBackBar from './_components/MobileBackBar'
import PriceDisplay from './_components/PriceDisplay'
import ProductDescription from './_components/ProductDescription'
import ProductHeader from './_components/ProductHeader'
import ProductImageGallery from './_components/ProductImageGallery'
import SkeletonDetail from './_components/SkeletonDetail'
import StockInfo from './_components/StockInfo'
import VariantSelector from './_components/VariantSelector'
import useProductDetail from './_components/useProductDetail'
import { useWebToast } from '@/components/WebToastProvider'

export default function ProductDetailClient(): ReactElement {
  const params = useParams<{ slug: string }>()
  const id = params?.slug ?? ''
  const router = useRouter()
  const { showToast } = useWebToast()

  const {
    product,
    loading,
    error,
    added,
    selectedValues,
    currentImage,
    hasVariants,
    selectedVariant,
    inStock,
    displayPrice,
    ctaDisabled,
    ctaLabel,
    setCurrentImage,
    setSelectedValues,
    isValueOutOfStock,
    handleAddToCart,
  } = useProductDetail(id)

  function handleAddWithToast() {
    handleAddToCart()
    if (product) showToast(`${product.name} 已加入購物車`)
  }

  if (loading) return <SkeletonDetail />
  if (error || !product) return <ErrorState message={error} onBack={() => router.back()} />

  const displayImage = selectedVariant?.image ?? product.image
  const carouselImages: string[] = product.images?.length
    ? product.images
    : displayImage
      ? [displayImage]
      : []
  const discountPct =
    product.originalPrice && product.originalPrice > displayPrice
      ? Math.round((1 - displayPrice / product.originalPrice) * 100)
      : null

  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      <MobileBackBar onBack={() => router.back()} />
      <Breadcrumb productName={product.name} />

      <div className="max-w-[1440px] mx-auto md:px-12 md:pb-16 pb-[140px]">
        <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] md:gap-12 md:items-start">
          <ProductImageGallery
            images={carouselImages}
            productName={product.name}
            currentImage={currentImage}
            onImageChange={setCurrentImage}
            discountPercent={discountPct}
          />

          <div className="px-4 md:px-0 py-5 md:py-2 flex flex-col gap-4">
            <Link
              href="/#products"
              className="hidden md:inline-flex items-center gap-1.5 font-jakarta text-[13px] text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors self-start"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              繼續購物
            </Link>
            <ProductHeader
              categoryName={product.category?.name}
              productName={product.name}
            />
            <PriceDisplay price={displayPrice} originalPrice={product.originalPrice} />

            {hasVariants && product.options && product.options.length > 0 && (
              <VariantSelector
                options={product.options}
                selectedValues={selectedValues}
                onSelect={(optionId, valueId) =>
                  setSelectedValues((prev) => ({ ...prev, [optionId]: valueId }))
                }
                isValueOutOfStock={isValueOutOfStock}
              />
            )}

            <StockInfo
              hasVariants={hasVariants}
              inStock={inStock}
              inventoryQuantity={product.inventory?.quantity}
              selectedVariant={selectedVariant}
            />

            <div className="hidden md:flex flex-col gap-3 pt-2">
              <AddToCartButton
                added={added}
                disabled={ctaDisabled}
                ctaLabel={ctaLabel}
                onClick={handleAddWithToast}
                variant="desktop"
              />
              <Link
                href="/cart"
                className="block text-center font-jakarta text-[13px] text-[#7C9070] hover:underline"
              >
                查看購物車
              </Link>
            </div>
          </div>
        </div>

        <ProductDescription
          productName={product.name}
          description={product.description}
          descriptionImages={product.descriptionImages}
        />
      </div>

      {/* 手機版固定底部 CTA */}
      <div
        className="md:hidden fixed left-0 right-0 bg-white border-t border-[#F0EFEC] z-40 px-4 py-3"
        style={{ bottom: 'calc(54px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <PriceDisplay
            price={displayPrice}
            originalPrice={product.originalPrice}
            variant="compact"
          />
          <AddToCartButton
            added={added}
            disabled={ctaDisabled}
            ctaLabel={ctaLabel}
            onClick={handleAddToCart}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  )
}
