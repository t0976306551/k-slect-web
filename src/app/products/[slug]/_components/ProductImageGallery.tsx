'use client'

import Image from 'next/image'
import ImageCarousel from './ImageCarousel'

interface ProductImageGalleryProps {
  readonly images: string[]
  readonly productName: string
  readonly currentImage: number
  readonly onImageChange: (index: number) => void
  readonly discountPercent: number | null
}

export default function ProductImageGallery({
  images,
  productName,
  currentImage,
  onImageChange,
  discountPercent,
}: ProductImageGalleryProps): React.ReactElement {
  return (
    <div>
      <div className="w-full aspect-[4/3] md:aspect-square md:rounded-[20px] overflow-hidden bg-[#F0EFEC] relative">
        <ImageCarousel
          images={images}
          alt={productName}
          current={currentImage}
          onChange={onImageChange}
        />
        {discountPercent && (
          <div className="absolute top-3 left-3 z-10 bg-[#D4845E] text-white font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden md:flex gap-2 mt-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onImageChange(i)}
              className={`w-[72px] h-[72px] rounded-[10px] overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === currentImage
                  ? 'border-[#7C9070] opacity-100'
                  : 'border-transparent opacity-55 hover:opacity-85'
              }`}
              aria-label={`第 ${i + 1} 張圖片`}
            >
              <Image
                src={src}
                alt={`${productName} ${i + 1}`}
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
