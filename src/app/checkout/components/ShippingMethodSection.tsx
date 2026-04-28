'use client'

import { Truck, Store } from 'lucide-react'
import type { ShippingMethod } from '@/types'
import type { FormState } from './shared'
import { CVS_PROVIDERS, INPUT_CLS, LABEL_CLS } from './shared'

interface ShippingMethodSectionProps {
  readonly form: FormState
  readonly onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  readonly onShippingMethodChange: (method: ShippingMethod) => void
}

export default function ShippingMethodSection({
  form,
  onChange,
  onShippingMethodChange,
}: ShippingMethodSectionProps) {
  const isCvs = form.shippingMethod === 'cvs_pickup'

  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 space-y-4">
      <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D]">配送方式</h2>

      <div className="grid grid-cols-2 gap-3">
        <ShippingOptionButton
          active={isCvs}
          icon={<Store size={17} className="text-[#7C9070]" />}
          label="超商取貨"
          desc="7-11 / 全家"
          onClick={() => onShippingMethodChange('cvs_pickup')}
        />
        <ShippingOptionButton
          active={!isCvs}
          icon={<Truck size={17} className="text-[#7C9070]" />}
          label="宅配到府"
          desc="黑貓宅急便"
          onClick={() => onShippingMethodChange('home_delivery')}
        />
      </div>

      {isCvs ? (
        <CvsPickupFields form={form} onChange={onChange} />
      ) : (
        <div>
          <label className={LABEL_CLS}>
            收件地址 <span className="text-[#D4845E]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.customerAddress}
            onChange={(e) => onChange('customerAddress', e.target.value)}
            className={INPUT_CLS}
            placeholder="台北市信義區..."
          />
        </div>
      )}
    </div>
  )
}

/* --- 內部子元件 --- */

interface ShippingOptionButtonProps {
  readonly active: boolean
  readonly icon: React.ReactNode
  readonly label: string
  readonly desc: string
  readonly onClick: () => void
}

function ShippingOptionButton({ active, icon, label, desc, onClick }: ShippingOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[12px] p-4 border-2 transition-all text-left ${
        active
          ? 'border-[#7C9070] bg-[#7C9070]/5'
          : 'border-[#E8E8E8] bg-white hover:border-[#C8C8C8]'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-[#F7F6F3] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">{label}</div>
        <div className="text-[11px] text-[#9E9E9E] mt-0.5">{desc}</div>
      </div>
    </button>
  )
}

interface CvsPickupFieldsProps {
  readonly form: FormState
  readonly onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
}

function CvsPickupFields({ form, onChange }: CvsPickupFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className={LABEL_CLS}>選擇超商</label>
        <div className="flex gap-2">
          {CVS_PROVIDERS.map((p) => {
            const active = form.shippingProvider === p.value
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => onChange('shippingProvider', p.value)}
                className={`flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] transition-all ${
                  active
                    ? 'border-[#7C9070] bg-[#7C9070]/5 text-[#2D2D2D]'
                    : 'border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#C8C8C8]'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.6fr] gap-4">
        <div>
          <label className={LABEL_CLS}>門市代碼</label>
          <input
            type="text"
            value={form.pickupStoreCode}
            onChange={(e) => onChange('pickupStoreCode', e.target.value)}
            className={INPUT_CLS}
            placeholder="例：123456"
          />
        </div>
        <div>
          <label className={LABEL_CLS}>
            門市名稱 <span className="text-[#D4845E]">*</span>
          </label>
          <input
            type="text"
            value={form.pickupStoreName}
            onChange={(e) => onChange('pickupStoreName', e.target.value)}
            className={INPUT_CLS}
            placeholder="例：松山門市"
          />
        </div>
      </div>
      <p className="text-[11px] text-[#9E9E9E] leading-relaxed">
        線上門市選擇器整合中，目前請手動填寫常用門市；下單後將以此資訊出貨。
      </p>
    </div>
  )
}
