'use client'

import type { FormState } from './shared'
import { INPUT_CLS, LABEL_CLS } from './shared'

interface ContactInfoSectionProps {
  readonly form: FormState
  readonly onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
}

export default function ContactInfoSection({ form, onChange }: ContactInfoSectionProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 space-y-4">
      <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D]">聯絡資訊</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLS}>
            姓名 <span className="text-[#D4845E]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.customerName}
            onChange={(e) => onChange('customerName', e.target.value)}
            className={INPUT_CLS}
            placeholder="王小明"
          />
        </div>
        <div>
          <label className={LABEL_CLS}>
            手機號碼 <span className="text-[#D4845E]">*</span>
          </label>
          <input
            type="tel"
            required
            value={form.customerPhone}
            onChange={(e) => onChange('customerPhone', e.target.value)}
            className={INPUT_CLS}
            placeholder="0912-345-678"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>
          電子郵件 <span className="text-[#D4845E]">*</span>
        </label>
        <input
          type="email"
          required
          value={form.customerEmail}
          onChange={(e) => onChange('customerEmail', e.target.value)}
          className={INPUT_CLS}
          placeholder="example@email.com"
        />
      </div>
    </div>
  )
}
