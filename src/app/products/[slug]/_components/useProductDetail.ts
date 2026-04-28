import { useState, useEffect, useRef } from 'react'
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
      v.optionValues?.some((ov) => ov.id === valueId),
    ),
  )
}

interface ProductDetailState {
  readonly product: ProductWithMeta | null
  readonly loading: boolean
  readonly error: string | null
  readonly added: boolean
  readonly selectedValues: Record<string, string>
  readonly currentImage: number
  readonly hasVariants: boolean
  readonly selectedVariant: ProductVariant | undefined
  readonly allOptionsSelected: boolean
  readonly inStock: boolean
  readonly isActive: boolean
  readonly displayPrice: number
  readonly ctaDisabled: boolean
  readonly ctaLabel: string | null
  readonly setCurrentImage: (index: number) => void
  readonly setSelectedValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
  readonly isValueOutOfStock: (optionId: string, valueId: string) => boolean
  readonly handleAddToCart: () => void
}

export default function useProductDetail(id: string): ProductDetailState {
  const [product, setProduct] = useState<ProductWithMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    async function load(): Promise<void> {
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
  const selectedVariant =
    hasVariants && product?.variants
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

  function isValueOutOfStock(optionId: string, valueId: string): boolean {
    if (!product?.variants) return false
    const tentative = { ...selectedValues, [optionId]: valueId }
    const entries = Object.entries(tentative)
    const matched = product.variants.filter((v) =>
      entries.every(([, vid]) => v.optionValues?.some((ov) => ov.id === vid)),
    )
    return matched.length > 0 && matched.every((v) => v.quantity === 0)
  }

  function handleAddToCart(): void {
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

  const ctaDisabled = !isActive || (hasVariants ? !allOptionsSelected || !inStock : !inStock)

  function getCtaLabel(): string | null {
    if (added) return null
    if (!isActive) return '已下架'
    if (hasVariants && !allOptionsSelected) return '請選擇型號'
    if (!inStock) return '已售完'
    return null
  }

  return {
    product,
    loading,
    error,
    added,
    selectedValues,
    currentImage,
    hasVariants,
    selectedVariant,
    allOptionsSelected,
    inStock,
    isActive,
    displayPrice,
    ctaDisabled,
    ctaLabel: getCtaLabel(),
    setCurrentImage,
    setSelectedValues,
    isValueOutOfStock,
    handleAddToCart,
  }
}
