'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StorefrontBanner } from '@/lib/api'

const FALLBACK_IMAGE = '/images/generated-1773832286774.png'

interface Props {
  banners: StorefrontBanner[]
  variant: 'mobile' | 'desktop'
}

export default function BannerCarousel({ banners, variant }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = banners.length

  const next = useCallback(() => setCurrent(i => (i + 1) % count), [count])
  const prev = useCallback(() => setCurrent(i => (i - 1 + count) % count), [count])

  useEffect(() => {
    if (count <= 1 || paused) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [count, paused, next])

  const containerClass =
    variant === 'mobile'
      ? 'w-full aspect-[4/3] overflow-hidden relative'
      : 'w-[580px] h-[420px] rounded-[20px] overflow-hidden flex-shrink-0 relative'

  if (count === 0) {
    return (
      <div className={containerClass}>
        <Image
          src={FALLBACK_IMAGE}
          alt="韓國好物"
          fill
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div
      className={containerClass}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 滑動區 */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map(banner => {
          const img = (
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              priority={current === 0}
            />
          )
          return (
            <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          )
        })}
      </div>

      {/* 左右箭頭（多張才顯示） */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="上一張"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft size={18} className="text-[#2D2D2D]" />
          </button>
          <button
            onClick={next}
            aria-label="下一張"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-1.5 transition-colors"
          >
            <ChevronRight size={18} className="text-[#2D2D2D]" />
          </button>
        </>
      )}

      {/* 圓點指示器（多張才顯示） */}
      {count > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`第 ${i + 1} 張`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
