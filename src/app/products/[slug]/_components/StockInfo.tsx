import type { ProductVariant } from '@/types'

interface StockInfoProps {
  readonly hasVariants: boolean
  readonly inStock: boolean
  readonly inventoryQuantity?: number
  readonly selectedVariant?: ProductVariant
}

export default function StockInfo({
  hasVariants,
  inStock,
  inventoryQuantity,
  selectedVariant,
}: StockInfoProps): React.ReactElement {
  const stockColorClass = inStock ? 'text-[#7C9070]' : 'text-[#D4845E]'

  return (
    <div className="border-t border-[#F0EFEC] pt-3">
      {!hasVariants && inventoryQuantity !== undefined && (
        <p className="font-jakarta text-[12px] text-[#AEAAA4]">
          庫存：
          <span className={`font-semibold ml-1 ${stockColorClass}`}>
            {inStock ? `${inventoryQuantity} 件可購` : '已售完'}
          </span>
        </p>
      )}
      {hasVariants && selectedVariant && (
        <p className="font-jakarta text-[12px] text-[#AEAAA4]">
          庫存：
          <span className={`font-semibold ml-1 ${stockColorClass}`}>
            {inStock ? `${selectedVariant.quantity} 件可購` : '此型號已售完'}
          </span>
        </p>
      )}
    </div>
  )
}
