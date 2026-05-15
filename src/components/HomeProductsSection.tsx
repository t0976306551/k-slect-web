'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, ShoppingBag, Sparkles, Cookie, Shirt,
  Package, ChevronDown, ChevronRight, ChevronLeft, Check, X, type LucideIcon,
} from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProducts, fetchCategories } from '@/lib/api'
import type { ProductWithMeta, CategorySummary } from '@/lib/api'

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'popular' | 'top-rated'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',    label: '預設排序'   },
  { value: 'price-asc',  label: '價格低到高' },
  { value: 'price-desc', label: '價格高到低' },
  { value: 'popular',    label: '最多銷售'   },
  { value: 'top-rated',  label: '最高評分'   },
]

type DisplayCategory = {
  slug: string
  label: string
  Icon: LucideIcon | null
  color: string
}

// slug → icon/color 對應，API 回傳的分類名稱用這裡補充視覺資訊
const SLUG_META: Record<string, { Icon: DisplayCategory['Icon']; color: string }> = {
  beauty:  { Icon: Sparkles, color: '#D4845E' },
  food:    { Icon: Cookie,   color: '#C68C40' },
  fashion: { Icon: Shirt,    color: '#5B9BD5' },
}

const VIRTUAL_ALL: DisplayCategory  = { slug: 'all', label: '全部',    Icon: null,    color: '#2D2D2D' }
const VIRTUAL_HOT: DisplayCategory  = { slug: 'hot', label: '熱銷推薦', Icon: Package, color: '#7C9070' }

const ADDED_FEEDBACK_DURATION_MS = 1500
const PAGE_SIZE = 24

function sortProducts(list: ProductWithMeta[], key: SortKey): ProductWithMeta[] {
  const arr = [...list]
  switch (key) {
    case 'price-asc':  return arr.sort((a, b) => a.price - b.price)
    case 'price-desc': return arr.sort((a, b) => b.price - a.price)
    case 'popular':    return arr.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
    case 'top-rated':  return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    default:           return arr
  }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[14px] md:rounded-[18px] border border-[#F0EFEC] overflow-hidden animate-pulse flex flex-col">
      <div className="w-full aspect-square bg-[#F0EFEC]" />
      <div className="p-3 md:p-4 flex flex-col gap-2">
        <div className="h-2 bg-[#F0EFEC] rounded w-1/3" />
        <div className="h-3 bg-[#F0EFEC] rounded w-full" />
        <div className="h-3 bg-[#F0EFEC] rounded w-2/3" />
        <div className="h-4 bg-[#F0EFEC] rounded w-1/2 mt-1" />
      </div>
      <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
        <div className="h-9 bg-[#F0EFEC] rounded-[10px]" />
      </div>
    </div>
  )
}

export default function HomeProductsSection({ defaultCategory }: { defaultCategory?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [allProducts, setAllProducts] = useState<ProductWithMeta[]>([])
  const [apiCategories, setApiCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortOpen, setSortOpen] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const sortRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  function updateScrollState() {
    const el = pillsRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  function scrollPills(dir: 'left' | 'right') {
    pillsRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' })
  }

  // 組合展示用分類：全部 + API 根分類 + 熱銷推薦
  const displayCategories = useMemo<DisplayCategory[]>(() => {
    const roots = apiCategories.filter(c => c.parentId === null)
    const middle = roots.map(c => ({
      slug: c.slug,
      label: c.name,
      ...(SLUG_META[c.slug] ?? { Icon: null, color: '#2D2D2D' }),
    }))
    return [VIRTUAL_ALL, ...middle, VIRTUAL_HOT]
  }, [apiCategories])

  // If defaultCategory is provided (category page), use it as fixed; otherwise read from URL
  const activeCategory = defaultCategory ?? (searchParams?.get('category') ?? 'all')
  const sortBy = (searchParams?.get('sort') ?? 'default') as SortKey

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  useEffect(() => {
    const el = pillsRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect() }
  }, [displayCategories])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  // IntersectionObserver：sentinel 進入視窗時自動載入更多
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + PAGE_SIZE) },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, catRes] = await Promise.all([fetchProducts(), fetchCategories()])
      if (prodRes.error) setError(prodRes.error.message)
      else setAllProducts((prodRes.data ?? []) as ProductWithMeta[])
      if (!catRes.error) setApiCategories(catRes.data ?? [])
    } catch {
      setError('載入商品失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const products = useMemo(() => {
    let list = allProducts
    if (activeCategory === 'hot') {
      // 虛擬分類：按銷售數排序取全部
      list = [...list].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
    } else if (activeCategory !== 'all') {
      list = list.filter(p => p.category?.slug === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return activeCategory === 'hot' ? list : sortProducts(list, sortBy)
  }, [allProducts, activeCategory, search, sortBy])

  // 分類/搜尋/排序改變時，重置顯示數量
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [activeCategory, search, sortBy])

  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (value === 'all' || value === 'default') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    if (defaultCategory) {
      // On a category page: category pills navigate to homepage; sort stays on current page
      if (key === 'category') {
        const dest = value === 'all' ? '/#products' : `/?category=${value}#products`
        router.push(dest, { scroll: false })
      } else {
        router.push(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
      }
    } else {
      router.push(`/${qs ? `?${qs}` : ''}#products`, { scroll: false })
    }
  }

  function handleAddToCart(product: ProductWithMeta) {
    addToCart({ productId: product.id, productName: product.name, price: product.price, slug: product.slug ?? undefined })
    setAddedIds(prev => new Set([...prev, product.id]))
    const existing = timers.current.get(product.id)
    if (existing) clearTimeout(existing)
    const t = setTimeout(() => {
      setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n })
      timers.current.delete(product.id)
    }, ADDED_FEEDBACK_DURATION_MS)
    timers.current.set(product.id, t)
  }

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? '預設排序'

  return (
    <section id="products" className="bg-[#F7F6F3]">
      {/* Filter Bar */}
      <div className="bg-white border-b border-[#F0EFEC] sticky top-14 md:top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-3 md:px-12 pt-3 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div className="relative flex-1 min-w-0">
            {/* 左側淡出 + 向左鍵 */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pointer-events-none">
                <div className="w-10 h-full bg-gradient-to-r from-white to-transparent" />
                <button
                  onClick={() => scrollPills('left')}
                  className="absolute left-0 pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#ECEAE6] shadow-sm hover:border-[#D0CEC8] transition-colors"
                >
                  <ChevronLeft size={13} strokeWidth={2} className="text-[#6B6B6B]" />
                </button>
              </div>
            )}
            {/* 右側淡出 + 向右鍵 */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pointer-events-none">
                <div className="w-10 h-full bg-gradient-to-l from-white to-transparent" />
                <button
                  onClick={() => scrollPills('right')}
                  className="absolute right-0 pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#ECEAE6] shadow-sm hover:border-[#D0CEC8] transition-colors"
                >
                  <ChevronRight size={13} strokeWidth={2} className="text-[#6B6B6B]" />
                </button>
              </div>
            )}
            <div ref={pillsRef} className="flex gap-2 overflow-x-auto no-scrollbar">
              {displayCategories.map(({ slug, label, Icon, color }) => {
                const isActive = activeCategory === slug
                return (
                  <button
                    key={slug}
                    onClick={() => setParam('category', slug)}
                    style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-jakarta text-[12px] font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'bg-transparent text-[#6B6B6B] border-[#ECEAE6] hover:border-[#D0CEC8] hover:text-[#2D2D2D]'
                    }`}
                  >
                    {Icon && <Icon size={11} strokeWidth={2} />}
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEAAA4] pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋商品..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-8 py-2 border border-[#ECEAE6] bg-[#F7F6F3] rounded-full text-[12px] text-[#2D2D2D] placeholder:text-[#C4C0BA] focus:outline-none focus:border-[#7C9070] focus:bg-white transition-all w-40 md:w-52"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEAAA4] hover:text-[#2D2D2D] transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative flex-shrink-0" ref={sortRef}>
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-jakarta text-[12px] font-medium border border-[#ECEAE6] bg-white text-[#2D2D2D] hover:border-[#D0CEC8] transition-colors whitespace-nowrap"
              >
                {activeSortLabel}
                <ChevronDown size={11} strokeWidth={2} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-[12px] border border-[#ECEAE6] shadow-[0_8px_24px_rgba(0,0,0,0.09)] overflow-hidden z-30 py-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setParam('sort', opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 font-jakarta text-[12px] flex items-center justify-between hover:bg-[#F7F6F3] transition-colors ${
                        sortBy === opt.value ? 'text-[#7C9070] font-semibold' : 'text-[#2D2D2D]'
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check size={11} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {!loading && !error && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 pb-2">
            <p className="font-jakarta text-[11px] text-[#AEAAA4]">
              {products.length > 0
                ? `共 ${products.length} 個商品`
                : search ? `「${search}」無搜尋結果` : '目前無商品'}
            </p>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="max-w-[1440px] mx-auto px-3 md:px-12 py-5 md:py-8">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-[#F0EFEC] rounded-[16px] p-8 text-center">
            <p className="font-jakarta text-[14px] text-[#6B6B6B] mb-3">{error}</p>
            <button onClick={loadProducts} className="font-jakarta text-[13px] font-semibold text-[#7C9070] hover:underline">
              重新載入
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#F0EFEC] flex items-center justify-center mb-2">
              <Search size={24} className="text-[#AEAAA4]" />
            </div>
            <p className="font-jakarta text-[15px] font-semibold text-[#2D2D2D]">
              {search ? `找不到「${search}」的商品` : '此分類暫無商品'}
            </p>
            <p className="font-jakarta text-[13px] text-[#AEAAA4]">
              {search ? '試試其他關鍵字，或瀏覽所有商品' : '請稍後再來查看'}
            </p>
            {(search || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearch(''); setParam('category', 'all') }}
                className="mt-2 font-jakarta text-[13px] font-semibold text-[#7C9070] border border-[#7C9070] px-5 py-2 rounded-full hover:bg-[#7C9070] hover:text-white transition-colors"
              >
                查看全部商品
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div
            key={`${activeCategory}-${sortBy}`}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5"
          >
            {visibleProducts.map((product, i) => {
              const href = `/products/${product.slug ?? product.id}`
              const inStock = product.status === 'active' && (product.inventory?.quantity ?? 0) > 0
              const isAdded = addedIds.has(product.id)
              return (
                <div
                  key={product.id}
                  style={{ animation: 'fade-up 0.4s cubic-bezier(0.25,1,0.5,1) both', animationDelay: `${Math.min(i * 55, 350)}ms` }}
                  className="group bg-white rounded-[14px] md:rounded-[18px] border border-[#F0EFEC] overflow-hidden hover:border-[#E0DDD8] hover:shadow-[0_6px_28px_rgba(0,0,0,0.07)] transition-shadow duration-300 flex flex-col"
                >
                  <Link href={href}>
                    <div className="w-full aspect-square overflow-hidden bg-[#F7F6F3] relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={36} className="text-[#D8D5D0]" />
                        </div>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="font-jakarta text-[11px] font-semibold text-[#6B6B6B] bg-white/90 px-2.5 py-1 rounded-full border border-[#E0DDD8]">
                            已售完
                          </span>
                        </div>
                      )}
                      {product.originalPrice && inStock && (
                        <div className="absolute top-2 left-2 bg-[#D4845E] text-white font-jakarta text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          特價
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5">
                      {product.category && (
                        <p className="font-jakarta text-[10px] md:text-[11px] text-[#AEAAA4] uppercase tracking-wide">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="font-jakarta font-semibold text-[12px] md:text-[13px] text-[#2D2D2D] leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <p className={`font-jakarta text-[14px] md:text-[15px] font-semibold tabular-nums ${product.originalPrice ? 'text-[#D4845E]' : 'text-[#7C9070]'}`}>
                          NT$ {product.price.toLocaleString('zh-TW')}
                        </p>
                        {product.originalPrice && (
                          <p className="font-jakarta text-[11px] text-[#AEAAA4] line-through tabular-nums">
                            {product.originalPrice.toLocaleString('zh-TW')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                      className={`w-full text-[12px] md:text-[13px] font-semibold font-jakarta py-2 md:py-2.5 rounded-[10px] transition-all duration-200 active:scale-95 cursor-pointer disabled:cursor-default ${
                        !inStock ? 'bg-[#F0EFEC] text-[#AEAAA4]'
                        : isAdded ? 'bg-[#5a7460] text-white'
                        : 'bg-[#7C9070] hover:bg-[#6a7d5f] text-white'
                      }`}
                    >
                      {!inStock ? '已售完' : isAdded ? '✓ 已加入' : '加入購物車'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 無限滾動 sentinel */}
        {!loading && !error && hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-[#ECEAE6] border-t-[#7C9070] animate-spin" />
          </div>
        )}
      </div>
    </section>
  )
}
