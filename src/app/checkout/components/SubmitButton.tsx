'use client'

interface SubmitButtonProps {
  readonly submitting: boolean
  readonly disabled: boolean
  readonly total: number
}

export function DesktopSubmitButton({ submitting, disabled, total }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="hidden md:flex w-full items-center justify-between bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] px-6 py-4 rounded-[12px] transition-colors"
    >
      <span>{submitting ? '處理中...' : '確認下單'}</span>
      {!submitting && (
        <span className="tabular-nums">NT$ {total.toLocaleString('zh-TW')}</span>
      )}
    </button>
  )
}

interface MobileSubmitButtonProps extends SubmitButtonProps {
  readonly formId: string
}

export function MobileSubmitButton({ submitting, disabled, total, formId }: MobileSubmitButtonProps) {
  return (
    <div
      className="md:hidden fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#F0EFEC] px-4 py-3"
      style={{ bottom: 'calc(54px + env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        type="submit"
        form={formId}
        disabled={disabled}
        className="w-full flex items-center justify-between bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] px-5 py-3.5 rounded-[12px] transition-colors"
      >
        <span>{submitting ? '處理中...' : '確認下單'}</span>
        {!submitting && (
          <span className="tabular-nums">NT$ {total.toLocaleString('zh-TW')}</span>
        )}
      </button>
    </div>
  )
}
