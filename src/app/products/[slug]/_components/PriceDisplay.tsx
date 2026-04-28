interface PriceDisplayProps {
  readonly price: number
  readonly originalPrice?: number | null
  readonly variant?: 'default' | 'compact'
}

export default function PriceDisplay({
  price,
  originalPrice,
  variant = 'default',
}: PriceDisplayProps): React.ReactElement {
  const hasDiscount = !!originalPrice
  const priceColor = hasDiscount ? 'text-[#D4845E]' : 'text-[#2D2D2D]'

  if (variant === 'compact') {
    return (
      <div className="flex flex-col min-w-0">
        <p className={`font-jakarta text-[17px] font-semibold tabular-nums leading-tight ${priceColor}`}>
          NT$ {price.toLocaleString('zh-TW')}
        </p>
        {hasDiscount && (
          <p className="font-jakarta text-[11px] text-[#AEAAA4] line-through tabular-nums leading-tight">
            NT$ {originalPrice.toLocaleString('zh-TW')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-baseline gap-2.5">
      <p className={`font-jakarta text-[26px] md:text-[30px] font-semibold tabular-nums leading-none ${priceColor}`}>
        NT$ {price.toLocaleString('zh-TW')}
      </p>
      {hasDiscount && (
        <p className="font-jakarta text-[15px] text-[#AEAAA4] line-through tabular-nums leading-none">
          NT$ {originalPrice.toLocaleString('zh-TW')}
        </p>
      )}
    </div>
  )
}
