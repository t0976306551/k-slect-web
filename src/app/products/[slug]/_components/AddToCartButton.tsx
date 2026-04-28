'use client'

import { Check, ShoppingBag } from 'lucide-react'

interface AddToCartButtonProps {
  readonly added: boolean
  readonly disabled: boolean
  readonly ctaLabel: string | null
  readonly onClick: () => void
  readonly variant: 'desktop' | 'mobile'
}

export default function AddToCartButton({
  added,
  disabled,
  ctaLabel,
  onClick,
  variant,
}: AddToCartButtonProps): React.ReactElement {
  const isDesktop = variant === 'desktop'
  const iconSize = isDesktop ? 16 : 15
  const addedLabel = isDesktop ? '已加入購物車' : '已加入'

  const className = isDesktop
    ? 'w-full flex items-center justify-center gap-2 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#F0EFEC] disabled:text-[#AEAAA4] text-white font-jakarta font-semibold text-[15px] py-4 rounded-[12px] transition-colors'
    : 'flex-1 flex items-center justify-center gap-1.5 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#F0EFEC] disabled:text-[#AEAAA4] text-white font-jakarta font-semibold text-[14px] py-3 rounded-[10px] transition-colors'

  function renderContent(): React.ReactElement {
    if (added) {
      return (
        <>
          <Check size={iconSize} strokeWidth={2.5} /> {addedLabel}
        </>
      )
    }
    if (ctaLabel) {
      return <>{ctaLabel}</>
    }
    return (
      <>
        <ShoppingBag size={iconSize} /> 加入購物車
      </>
    )
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {renderContent()}
    </button>
  )
}
