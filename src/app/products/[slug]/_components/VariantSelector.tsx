'use client'

import type { ProductOption } from '@/types'

interface VariantSelectorProps {
  readonly options: ProductOption[]
  readonly selectedValues: Record<string, string>
  readonly onSelect: (optionId: string, valueId: string) => void
  readonly isValueOutOfStock: (optionId: string, valueId: string) => boolean
}

function getValueButtonClass(isSelected: boolean, outOfStock: boolean): string {
  if (isSelected) {
    return 'border-[#7C9070] bg-[#EBF1E8] text-[#7C9070]'
  }
  if (outOfStock) {
    return 'border-[#ECEAE6] text-[#C4C0BA] line-through cursor-not-allowed bg-[#F7F6F3]'
  }
  return 'border-[#ECEAE6] text-[#2D2D2D] hover:border-[#7C9070] bg-white'
}

export default function VariantSelector({
  options,
  selectedValues,
  onSelect,
  isValueOutOfStock,
}: VariantSelectorProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 border-t border-[#F0EFEC] pt-4">
      {options.map((option) => (
        <div key={option.id}>
          <p className="font-jakarta text-[11px] font-semibold text-[#AEAAA4] mb-2.5 uppercase tracking-[0.08em]">
            {option.name}
            {selectedValues[option.id] && (
              <span className="ml-2 text-[#2D2D2D] normal-case font-normal tracking-normal">
                · {option.values.find((v) => v.id === selectedValues[option.id])?.value}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((val) => {
              const isSelected = selectedValues[option.id] === val.id
              const outOfStock = isValueOutOfStock(option.id, val.id)
              return (
                <button
                  key={val.id}
                  onClick={() => onSelect(option.id, val.id)}
                  disabled={outOfStock}
                  className={`px-3.5 py-2 rounded-[10px] text-[13px] font-jakarta font-medium border transition-all ${getValueButtonClass(isSelected, outOfStock)}`}
                >
                  {val.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
