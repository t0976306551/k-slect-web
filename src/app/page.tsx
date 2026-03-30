import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Sparkles,
  Cookie,
  Shirt,
  Flame,
  Package,
  Leaf,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'
import { fetchProducts } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/mock-handlers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '韓好物 | 韓國直送嚴選好物',
  description: '從首爾到台灣，美妝、零食、服飾一站購足。加入 LINE 好友，搶先收到新品與獨家優惠。',
}

const categories = [
  { name: '美妝保養', slug: 'beauty', icon: Sparkles },
  { name: '食品零食', slug: 'food', icon: Cookie },
  { name: '服飾配件', slug: 'fashion', icon: Shirt },
  { name: '保健大品', slug: 'health', icon: Leaf },
  { name: '熱銷推薦', slug: 'hot', icon: Flame },
]

export default async function HomePage() {
  const res = await fetchProducts({ status: 'active' })
  const allProducts = (res.data ?? []) as ProductWithMeta[]
  const hotProducts = allProducts.slice(0, 4)
  return (
    <div className="bg-[#F7F6F3]">
      {/* Hero — Desktop: white bg + big image, Mobile: sage bg + small side image */}
      <section className="md:max-w-[1440px] md:mx-auto md:px-12 md:h-[400px] md:flex md:items-center md:gap-12 md:bg-transparent bg-[#7C9070] px-4 py-5 flex items-center gap-3 min-h-[180px]">
        {/* Text */}
        <div className="flex-1 flex flex-col gap-2 md:gap-5">
          <h1 className="font-jakarta md:font-fraunces text-[25px] md:text-[48px] font-bold md:font-medium text-white md:text-[#2D2D2D] leading-[1.2] md:tracking-[-1px]">
            韓國直送<br />嚴選好物
          </h1>
          <p className="font-jakarta text-[11px] md:text-[16px] text-white/80 md:text-[#6B6B6B] leading-[1.5] md:leading-[1.6] hidden md:block">
            從首爾到台灣，美妝、零食、服飾一站購足。<br />
            加入 LINE 好友，搶先收到新品與獨家優惠。
          </p>
          <p className="font-jakarta text-[11px] text-white/80 leading-[1.5] md:hidden">
            精選台灣女生最愛的韓系美妝、零食、服飾
          </p>
          <div className="flex items-center gap-2 md:gap-3 mt-1">
            <Link
              href="/products"
              className="font-jakarta text-[13px] md:text-[14px] font-semibold text-[#7C9070] md:text-white bg-white md:bg-[#7C9070] px-4 md:px-7 py-2 md:py-3.5 rounded-[20px] md:rounded-[10px] hover:opacity-90 transition-opacity"
            >
              立即選購
            </Link>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-jakarta text-[14px] font-semibold text-white bg-[#06C755] px-7 py-3.5 rounded-[10px] hidden md:flex items-center gap-2 hover:bg-[#05b34b] transition-colors"
            >
              <MessageCircle size={16} />
              加入 LINE
            </a>
          </div>
        </div>
        {/* Desktop image */}
        <div className="w-[560px] h-[360px] rounded-[16px] overflow-hidden flex-shrink-0 hidden md:block">
          <Image
            src="/images/generated-1773832286774.png"
            alt="韓國好物"
            width={560}
            height={360}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        {/* Mobile side image */}
        <div className="w-[110px] h-[140px] rounded-[12px] overflow-hidden flex-shrink-0 md:hidden">
          <Image
            src="/images/generated-1773832286774.png"
            alt="韓國好物"
            width={110}
            height={140}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </section>

      {/* Categories — Desktop: centered cards, Mobile: horizontal icon row */}
      {/* Mobile categories */}
      <section className="md:hidden bg-white border-b border-[#F0EFEC] px-4 py-3 flex items-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex-1 flex flex-col items-center gap-[5px]"
            >
              <div className="w-11 h-11 rounded-[12px] bg-[#7C907025] flex items-center justify-center">
                <Icon size={22} className="text-[#7C9070]" strokeWidth={1.75} />
              </div>
              <span className="font-jakarta text-[10px] text-[#6B6B6B] text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </section>
      {/* Desktop categories */}
      <section className="hidden md:flex max-w-[1440px] mx-auto px-12 py-8 gap-5 justify-center">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="w-[160px] h-[100px] bg-white rounded-[16px] border border-[#F0EFEC] flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow flex-shrink-0"
            >
              <Icon size={28} className="text-[#7C9070]" strokeWidth={1.75} />
              <span className="font-jakarta text-[13px] font-semibold text-[#2D2D2D]">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </section>

      {/* Hot Products */}
      <section className="max-w-[1440px] mx-auto px-3 md:px-12 py-4 md:py-8 flex flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between px-1 md:px-0">
          <h2 className="font-jakarta md:font-fraunces text-[16px] md:text-[24px] font-semibold md:font-medium text-[#2D2D2D]">
            熱銷商品
          </h2>
          <Link
            href="/products"
            className="font-jakarta text-[12px] md:text-[13px] font-semibold text-[#7C9070] flex items-center gap-1 hover:opacity-75 transition-opacity"
          >
            查看更多 › <span className="hidden md:inline"><ArrowRight size={14} /></span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-5">
          {hotProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug ?? product.id}`}
              className="bg-white rounded-[14px] md:rounded-[16px] border border-[#F0EFEC] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="w-full h-[115px] md:h-[220px] overflow-hidden bg-[#F0EFEC]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={220}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl md:text-6xl">🛍️</div>
                )}
              </div>
              <div className="p-2.5 md:p-4 flex flex-col gap-1 md:gap-2">
                <p className="font-jakarta text-[13px] md:text-[14px] font-semibold text-[#2D2D2D] leading-tight line-clamp-2">
                  {product.name}
                </p>
                {product.originalPrice && (
                  <p className="font-jakarta text-[11px] md:text-[13px] text-[#8E8E93] line-through">
                    NT$ {product.originalPrice.toLocaleString('zh-TW')}
                  </p>
                )}
                <p className={`font-jakarta text-[14px] md:text-[16px] font-semibold ${product.originalPrice ? 'text-[#D4845E]' : 'text-[#7C9070]'}`}>
                  NT$ {product.price.toLocaleString('zh-TW')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
