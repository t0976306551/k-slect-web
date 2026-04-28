'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

interface ImageCarouselProps {
  readonly images: string[]
  readonly alt: string
  readonly current: number
  readonly onChange: (index: number) => void
}

export default function ImageCarousel({
  images,
  alt,
  current,
  onChange,
}: ImageCarouselProps): React.ReactElement {
  const touchStartX = useRef<number | null>(null)
  const count = images.length

  if (count === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ShoppingBag size={72} className="text-[#D8D5D0]" />
      </div>
    )
  }

  function prev(): void {
    onChange((current - 1 + count) % count)
  }

  function next(): void {
    onChange((current + 1) % count)
  }

  return (
    <>
      <div
        className="flex h-full will-change-transform transition-transform duration-[350ms] ease-out"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${current * (100 / count)}%)`,
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              next()
            } else {
              prev()
            }
          }
          touchStartX.current = null
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative h-full flex-shrink-0"
            style={{ width: `${100 / count}%` }}
          >
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

      {count > 1 && (
        <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/80'
              }`}
              aria-label={`第 ${i + 1} 張`}
            />
          ))}
        </div>
      )}
    </>
  )
}
