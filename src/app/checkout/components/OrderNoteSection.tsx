'use client'

import type { FormState } from './shared'
import { INPUT_CLS } from './shared'

interface OrderNoteSectionProps {
  readonly note: string
  readonly onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
}

export default function OrderNoteSection({ note, onChange }: OrderNoteSectionProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
      <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">訂單備註</h2>
      <textarea
        value={note}
        onChange={(e) => onChange('note', e.target.value)}
        rows={3}
        className={`${INPUT_CLS} resize-none`}
        placeholder="有任何特別需求請填寫..."
      />
    </div>
  )
}
