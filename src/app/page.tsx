import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Sparkles,
  Cookie,
  Shirt,
  Package,
  Leaf,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { fetchProducts, fetchCategories } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/mock-handlers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '韓好物 | 韓國直送嚴選好物',
  description: '從首爾到台灣，美妝、零食、服飾一站購足。加入 LINE 好友，搶先收到新品與獨家優惠。',
}

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  cookie: Cookie,
  shirt: Shirt,
  leaf: Leaf,
}

const trustItems = [
  { icon: ShieldCheck, label: '正品保證' },
  { icon: Truck, label: '快速出貨' },
  { icon: MessageCircle, label: 'LINE 客服' },
]

function HomeProductCard({ product, badge }: { product: ProductWithMeta; badge?: string }) {
  const inStock = product.status === 'active' && (product.inventory?.quantity ?? 0) > 0
  return (
    <Link
      href={`/products/${product.slug ?? product.id}`}
      className="group bg-white rounded-[14px] md:rounded-[18px] overflow-hidden border border-[#F0EFEC] hover:border-[#E0DDD8] hover:shadow-[0_6px_28px_rgba(0,0,0,0.07)] transition-shadow duration-300"
    >
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
        {(badge || product.originalPrice) && inStock && (
          <div className={`absolute top-2 left-2 md:top-2.5 md:left-2.5 text-white font-jakarta text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge === 'NEW' ? 'bg-[#7C9070]' : 'bg-[#D4845E]'}`}>
            {badge ?? '特價'}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5">
        {product.category && (
          <p className="font-jakarta text-[10px] md:text-[11px] text-[#AEAAA4] uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <p className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#2D2D2D] leading-snug line-clamp-2">
          {product.name}
        </p>
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
  )
}

export default async function HomePage() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetchProducts({ status: 'active' }),
    fetchCategories(),
  ])
  const allProducts = (productsRes.data ?? []) as ProductWithMeta[]
  const hotProducts = allProducts.slice(0, 8)
  const beautyProducts = allProducts.filter(p => p.categoryId === 'beauty')
  const foodProducts = allProducts.filter(p => p.categoryId === 'food')
  const fashionProducts = allProducts.filter(p => p.categoryId === 'fashion')
  const categories = categoriesRes.data ?? []

  return (
    <div className="bg-[#F7F6F3]">

      {/* ── HERO ── */}

      {/* Mobile Hero */}
      <section className="md:hidden bg-white">
        <div className="w-full aspect-[4/3] overflow-hidden">
          <Image
            src="/images/generated-1773832286774.png"
            alt="韓國好物"
            width={800}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="px-5 pt-6 pb-7 flex flex-col gap-3">
          <p className="font-jakarta text-[11px] font-semibold tracking-[0.1em] uppercase text-[#7C9070]">
            From Seoul · 直送台灣
          </p>
          <h1 className="font-fraunces text-[30px] font-medium text-[#2D2D2D] leading-[1.15] tracking-[-0.5px]">
            韓國直送<br />嚴選好物
          </h1>
          <p className="font-jakarta text-[13px] text-[#6B6B6B] leading-[1.65]">
            精選台灣女生最愛的韓系美妝、零食、服飾
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <Link
              href="/products"
              className="font-jakarta text-[13px] font-semibold text-white bg-[#7C9070] px-5 py-2.5 rounded-[10px] hover:bg-[#6a7d5f] transition-colors"
            >
              立即選購
            </Link>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-jakarta text-[13px] font-semibold text-[#06C755] border border-[#06C755] px-5 py-2.5 rounded-[10px] flex items-center gap-1.5 hover:bg-[#f0fff4] transition-colors"
            >
              <MessageCircle size={14} />
              加入 LINE
            </a>
          </div>
        </div>
      </section>

      {/* Desktop Hero */}
      <section className="hidden md:block bg-white">
        <div className="max-w-[1440px] mx-auto px-12 py-16 flex items-center gap-16">
          <div className="flex-1 flex flex-col gap-7 max-w-[520px]">
            <p className="font-jakarta text-[12px] font-semibold tracking-[0.12em] uppercase text-[#7C9070]">
              From Seoul · 直送台灣
            </p>
            <h1 className="font-fraunces text-[clamp(40px,4vw,60px)] font-medium text-[#2D2D2D] leading-[1.1] tracking-[-1.5px]">
              韓國直送<br />嚴選好物
            </h1>
            <p className="font-jakarta text-[15px] text-[#6B6B6B] leading-[1.7]">
              精選台灣女生最愛的韓系美妝、零食、服飾，直送到府。
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="font-jakarta text-[14px] font-semibold text-white bg-[#7C9070] px-8 py-3.5 rounded-[10px] hover:bg-[#6a7d5f] transition-colors"
              >
                立即選購
              </Link>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-jakarta text-[14px] font-semibold text-[#06C755] border border-[#06C755] px-8 py-3.5 rounded-[10px] flex items-center gap-2 hover:bg-[#f0fff4] transition-colors"
              >
                <MessageCircle size={16} />
                加入 LINE
              </a>
            </div>
          </div>
          <div className="w-[580px] h-[420px] rounded-[20px] overflow-hidden flex-shrink-0">
            <Image
              src="/images/generated-1773832286774.png"
              alt="韓國好物"
              width={580}
              height={420}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-y border-[#F0EFEC]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 md:py-3.5 flex items-center justify-center gap-8 md:gap-16">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 md:gap-2">
              <Icon size={13} className="text-[#7C9070]" strokeWidth={1.75} />
              <span className="font-jakarta text-[11px] md:text-[12px] font-medium text-[#6B6B6B]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="bg-white mt-3 border-y border-[#F0EFEC]">
        {/* Mobile: horizontal scroll pills */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const Icon = (cat.icon ? iconMap[cat.icon] : null) ?? Package
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#ECEAE6] bg-white hover:border-[#7C9070] transition-colors group"
                >
                  <Icon size={13} className="text-[#7C9070]" strokeWidth={1.75} />
                  <span className="font-jakarta text-[12px] font-medium text-[#2D2D2D] whitespace-nowrap group-hover:text-[#7C9070] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
        {/* Desktop: pill row */}
        <div className="hidden md:block max-w-[1440px] mx-auto px-12 py-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            {categories.map((cat) => {
              const Icon = (cat.icon ? iconMap[cat.icon] : null) ?? Package
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#ECEAE6] bg-[#F7F6F3] hover:border-[#7C9070] hover:bg-white hover:shadow-sm transition-all group"
                >
                  <Icon size={15} className="text-[#7C9070]" strokeWidth={1.75} />
                  <span className="font-jakarta text-[13px] font-medium text-[#2D2D2D] group-hover:text-[#7C9070] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOT PRODUCTS ── */}
      <section className="max-w-[1440px] mx-auto px-3 md:px-12 py-6 md:py-10">
        <div className="flex items-center justify-between px-1 md:px-0 mb-4 md:mb-6">
          <h2 className="font-fraunces text-[20px] md:text-[26px] font-medium text-[#2D2D2D] tracking-tight">
            本週精選
          </h2>
          <Link
            href="/products"
            className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#7C9070] flex items-center gap-1 hover:gap-2 transition-all duration-200"
          >
            查看更多 <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-5">
          {hotProducts.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── CATEGORY SECTIONS ── */}
      <div className="border-t border-[#ECEAE6] mx-3 md:mx-12" />

      {/* Beauty */}
      {beautyProducts.length > 0 && (
        <section className="w-full bg-[#FBF0EE] py-6 md:py-10">
          <div className="max-w-[1440px] mx-auto px-3 md:px-12">
            <div className="flex items-center justify-between px-1 md:px-0 mb-4 md:mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#D4845E]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={15} className="text-[#D4845E]" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-fraunces text-[20px] md:text-[26px] font-medium text-[#2D2D2D] tracking-tight leading-none">
                    美妝保養
                  </h2>
                  <p className="font-jakarta text-[11px] md:text-[12px] text-[#AEAAA4] mt-0.5">韓系護膚，每日必備</p>
                </div>
              </div>
              <Link
                href="/products?category=beauty"
                className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#D4845E] flex items-center gap-1 hover:gap-2 transition-all duration-200 whitespace-nowrap"
              >
                查看全部 <ArrowRight size={13} />
              </Link>
            </div>
            {/* Mobile scroll */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:hidden">
              {beautyProducts.map((product) => (
                <div key={product.id} className="w-[47vw] max-w-[210px] flex-shrink-0 snap-start">
                  <HomeProductCard product={product} />
                </div>
              ))}
              <Link
                href="/products?category=beauty"
                className="w-[36vw] max-w-[160px] flex-shrink-0 snap-start flex flex-col items-center justify-center rounded-[14px] bg-white/70 border border-[#F0CECC] aspect-[3/4] gap-2 text-[#D4845E] self-start"
              >
                <ArrowRight size={18} strokeWidth={1.75} />
                <span className="font-jakarta text-[11px] font-semibold">查看全部</span>
              </Link>
            </div>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-5">
              {beautyProducts.slice(0, 4).map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Food */}
      {foodProducts.length > 0 && (
        <section className="w-full bg-[#FDF7EE] py-6 md:py-10">
          <div className="max-w-[1440px] mx-auto px-3 md:px-12">
            <div className="flex items-center justify-between px-1 md:px-0 mb-4 md:mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#C68C40]/20 flex items-center justify-center flex-shrink-0">
                  <Cookie size={15} className="text-[#C68C40]" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-fraunces text-[20px] md:text-[26px] font-medium text-[#2D2D2D] tracking-tight leading-none">
                    食品零食
                  </h2>
                  <p className="font-jakarta text-[11px] md:text-[12px] text-[#AEAAA4] mt-0.5">首爾熱銷，追劇必備</p>
                </div>
              </div>
              <Link
                href="/products?category=food"
                className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#C68C40] flex items-center gap-1 hover:gap-2 transition-all duration-200 whitespace-nowrap"
              >
                查看全部 <ArrowRight size={13} />
              </Link>
            </div>
            {/* Mobile scroll */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:hidden">
              {foodProducts.map((product) => (
                <div key={product.id} className="w-[47vw] max-w-[210px] flex-shrink-0 snap-start">
                  <HomeProductCard product={product} />
                </div>
              ))}
              <Link
                href="/products?category=food"
                className="w-[36vw] max-w-[160px] flex-shrink-0 snap-start flex flex-col items-center justify-center rounded-[14px] bg-white/70 border border-[#E8D5B0] aspect-[3/4] gap-2 text-[#C68C40] self-start"
              >
                <ArrowRight size={18} strokeWidth={1.75} />
                <span className="font-jakarta text-[11px] font-semibold">查看全部</span>
              </Link>
            </div>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-5">
              {foodProducts.slice(0, 4).map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fashion */}
      {fashionProducts.length > 0 && (
        <section className="w-full bg-[#EEF3FA] py-6 md:py-10">
          <div className="max-w-[1440px] mx-auto px-3 md:px-12">
            <div className="flex items-center justify-between px-1 md:px-0 mb-4 md:mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5B9BD5]/20 flex items-center justify-center flex-shrink-0">
                  <Shirt size={15} className="text-[#5B9BD5]" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-fraunces text-[20px] md:text-[26px] font-medium text-[#2D2D2D] tracking-tight leading-none">
                    服飾配件
                  </h2>
                  <p className="font-jakarta text-[11px] md:text-[12px] text-[#AEAAA4] mt-0.5">韓系穿搭，輕鬆入手</p>
                </div>
              </div>
              <Link
                href="/products?category=fashion"
                className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#5B9BD5] flex items-center gap-1 hover:gap-2 transition-all duration-200 whitespace-nowrap"
              >
                查看全部 <ArrowRight size={13} />
              </Link>
            </div>
            {/* Mobile scroll */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:hidden">
              {fashionProducts.map((product) => (
                <div key={product.id} className="w-[47vw] max-w-[210px] flex-shrink-0 snap-start">
                  <HomeProductCard product={product} />
                </div>
              ))}
              <Link
                href="/products?category=fashion"
                className="w-[36vw] max-w-[160px] flex-shrink-0 snap-start flex flex-col items-center justify-center rounded-[14px] bg-white/70 border border-[#C0D4EC] aspect-[3/4] gap-2 text-[#5B9BD5] self-start"
              >
                <ArrowRight size={18} strokeWidth={1.75} />
                <span className="font-jakarta text-[11px] font-semibold">查看全部</span>
              </Link>
            </div>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-5">
              {fashionProducts.slice(0, 4).map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LINE CTA BANNER ── */}
      <section className="mx-3 md:mx-12 mb-8 md:mb-12 mt-5 md:mt-8">
        <div className="bg-[#7C9070] rounded-[16px] md:rounded-[20px] px-6 md:px-12 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="font-fraunces text-white text-[22px] md:text-[26px] font-medium leading-snug tracking-tight">
              加入 LINE 好友
            </p>
            <p className="font-jakarta text-white/70 text-[12px] md:text-[14px] leading-relaxed">
              搶先收到新品消息與限定優惠，每週精選韓貨直送你
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 font-jakarta text-[13px] md:text-[14px] font-semibold text-[#7C9070] bg-white px-6 md:px-8 py-2.5 md:py-3 rounded-[10px] flex items-center gap-2 hover:bg-[#f5f5f5] transition-colors self-start md:self-auto"
          >
            <MessageCircle size={15} />
            立即加入
          </a>
        </div>
      </section>

    </div>
  )
}
