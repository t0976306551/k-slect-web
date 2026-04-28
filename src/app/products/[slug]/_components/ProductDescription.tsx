import Image from 'next/image'

interface ProductDescriptionProps {
  readonly productName: string
  readonly description: string | null
  readonly descriptionImages: string[] | null | undefined
}

export default function ProductDescription({
  productName,
  description,
  descriptionImages,
}: ProductDescriptionProps): React.ReactElement | null {
  const hasDescription = !!description
  const hasImages = (descriptionImages?.length ?? 0) > 0

  if (!hasDescription && !hasImages) return null

  return (
    <section className="mt-10 md:mt-16 px-4 md:px-0 border-t border-[#F0EFEC] pt-8 md:pt-12">
      <h2 className="font-fraunces text-[18px] md:text-[22px] font-medium text-[#2D2D2D] mb-6">
        商品說明
      </h2>
      {hasDescription && (
        <div className="max-w-[680px] mb-8">
          <p className="font-jakarta text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.9] whitespace-pre-line">
            {description}
          </p>
        </div>
      )}
      {hasImages && descriptionImages && (
        <div className="flex flex-col gap-4 md:gap-6">
          {descriptionImages.map((src, i) => (
            <div
              key={i}
              className="rounded-[12px] md:rounded-[16px] overflow-hidden bg-[#F0EFEC]"
            >
              <Image
                src={src}
                alt={`${productName} 說明圖 ${i + 1}`}
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
