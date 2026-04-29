'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, ShoppingBag, Sparkles, Cookie, Shirt,
  Package, ChevronDown, Check, X,
} from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProducts } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
type SortKey = 'default' | 'price-asc' | 'price-desc' | 'popular' | 'top-rated'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',    label: '預設排序'   },
  { value: 'price-asc',  label: '價格低到高' },
  { value: 'price-desc', label: '價格高到低' },
  { value: 'popular',    label: '最多銷售'   },
  { value: 'top-rated',  label: '最高評分'   },
]

const CATEGORIES = [
  { slug: 'all',     label: '全部',    Icon: null,     color: '#2D2D2D' },
  { slug: 'beauty',  label: '美妝保養', Icon: Sparkles, color: '#D4845E' },
  { slug: 'food',    label: '食品零食', Icon: Cookie,   color: '#C68C40' },
  { slug: 'fashion', label: '服飾配件', Icon: Shirt,    color: '#5B9BD5' },
  { slug: 'hot',     label: '熱銷推薦', Icon: Package,  color: '#7C9070' },
]

const ADDED_FEEDBACK_DURATION_MS = 1500

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

// ── Skeleton ─────────────────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [allProducts, setAllProducts] = useState<ProductWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortOpen, setSortOpen] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const sortRef = useRef<HTMLDivElement>(null)

  const activeCategory = searchParams?.get('category') ?? 'all'
  const sortBy = (searchParams?.get('sort') ?? 'default') as SortKey

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts()
      if (res.error) setError(res.error.message)
      else setAllProducts((res.data ?? []) as ProductWithMeta[])
    } catch {
      setError('載入商品失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const products = useMemo(() => {
    let list = allProducts
    if (activeCategory !== 'all') list = list.filter(p => p.categoryId === activeCategory)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return sortProducts(list, sortBy)
  }, [allProducts, activeCategory, search, sortBy])

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (value === 'all' || value === 'default') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
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

  const pageTitle = activeCategory !== 'all'
    ? (CATEGORIES.find(c => c.slug === activeCategory)?.label ?? '全部商品')
    : '全部商品'

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? '預設排序'

  return (
    <div className="bg-[#F7F6F3] min-h-screen">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[#F0EFEC]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-5 md:pt-8 pb-3 md:pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-0">
          <div>
            <h1 className="font-fraunces text-[22px] md:text-[30px] font-medium text-[#2D2D2D] tracking-tight leading-tight">
              {pageTitle}
            </h1>
            {!loading && !error && (
              <p className="font-jakarta text-[12px] text-[#AEAAA4] mt-1">
                {products.length > 0
                  ? `共 ${products.length} 個商品`
                  : search ? `「${search}」無搜尋結果` : '目前無商品'}
              </p>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEAAA4] pointer-events-none" />
            <input
              type="text"
              placeholder="搜尋商品..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-[#ECEAE6] bg-[#F7F6F3] rounded-full text-[13px] text-[#2D2D2D] placeholder:text-[#C4C0BA] focus:outline-none focus:border-[#7C9070] focus:bg-white transition-all w-full md:w-64"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEAAA4] hover:text-[#2D2D2D] transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="max-w-[1440px] mx-auto px-3 md:px-12 pb-3 flex items-center gap-3">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 flex-1 min-w-0">
            {CATEGORIES.map(({ slug, label, Icon, color }) => {
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

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-jakarta text-[12px] font-medium border border-[#ECEAE6] bg-white text-[#2D2D2D] hover:border-[#D0CEC8] transition-colors whitespace-nowrap"
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

      {/* ── Content ── */}
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
            {products.map((product, i) => {
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
      </div>
    </div>
  )
}
