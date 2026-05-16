import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  MessageCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import HomeProductsSection from '@/components/HomeProductsSection'
import BannerCarousel from '@/components/BannerCarousel'
import { fetchBanners } from '@/lib/api'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '韓好物 | 韓國直送嚴選好物',
  description: '從首爾到台灣，美妝、零食、服飾一站購足。加入 LINE 好友，搶先收到新品與獨家優惠。',
}

const trustItems = [
  { icon: ShieldCheck, label: '品質嚴選' },
  { icon: Truck, label: '快速出貨' },
  { icon: MessageCircle, label: 'LINE 客服' },
] as const

export default async function HomePage() {
  const bannersRes = await fetchBanners().catch(() => ({ data: null, error: null }))
  const banners = bannersRes.data ?? []

  return (
    <div className="bg-[#F7F6F3]">

      {/* ── HERO ── */}

      {/* Mobile Hero */}
      <section className="md:hidden bg-white">
        <BannerCarousel banners={banners} variant="mobile" />
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
            <a
              href="#products"
              className="font-jakarta text-[13px] font-semibold text-white bg-[#7C9070] px-5 py-2.5 rounded-[10px] hover:bg-[#6a7d5f] transition-colors"
            >
              立即選購
            </a>
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
              <a
                href="#products"
                className="font-jakarta text-[14px] font-semibold text-white bg-[#7C9070] px-8 py-3.5 rounded-[10px] hover:bg-[#6a7d5f] transition-colors"
              >
                立即選購
              </a>
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
          <BannerCarousel banners={banners} variant="desktop" />
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

      {/* ── PRODUCTS SECTION ── */}
      <Suspense>
        <HomeProductsSection />
      </Suspense>

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
