'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { fetchAccountProfile, updateAccountProfile } from '@/lib/api'
import type { MemberProfile, ShippingMethod, ShippingProvider } from '@/types'

const SHIPPING_METHOD_LABEL: Record<ShippingMethod, string> = {
  cvs_pickup: '超商取貨',
  home_delivery: '宅配到府',
}

const CVS_PROVIDERS: { value: ShippingProvider; label: string }[] = [
  { value: 'seven_eleven', label: '7-11' },
  { value: 'family_mart', label: '全家' },
]

export default function ProfileClient() {
  const router = useRouter()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    fetchAccountProfile()
      .then((res) => {
        if (res.error) {
          if (res.error.code === 'UNAUTHORIZED') {
            router.replace('/login?from=/account/profile')
            return
          }
          setError(res.error.message)
        } else {
          setProfile(res.data)
        }
      })
      .catch(() => setError('載入失敗，請稍後再試'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError(null)
    try {
      const res = await updateAccountProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        defaultShippingMethod: profile.defaultShippingMethod,
        defaultShippingProvider: profile.defaultShippingProvider,
      })
      if (res.error) {
        setError(res.error.message)
      } else {
        setProfile(res.data)
        setSavedAt(Date.now())
      }
    } catch {
      setError('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof MemberProfile>(key: K, value: MemberProfile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev))
    setSavedAt(null)
  }

  const inputCls =
    'w-full border border-[#E8E8E8] bg-white rounded-[10px] px-4 py-3 text-[14px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all'
  const labelCls =
    'block text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E] mb-2'

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const cvsProviderValue: ShippingProvider | undefined =
    profile.defaultShippingProvider === 'seven_eleven' ||
    profile.defaultShippingProvider === 'family_mart'
      ? profile.defaultShippingProvider
      : undefined

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/account"
          className="flex items-center justify-center w-9 h-9 -ml-2 rounded-full hover:bg-white transition-colors"
          aria-label="返回"
        >
          <ArrowLeft size={18} className="text-[#2D2D2D]" />
        </Link>
        <h1 className="font-fraunces font-medium text-[24px] md:text-[28px] text-[#2D2D2D]">
          個人資料設定
        </h1>
      </div>

      <p className="text-[13px] text-[#9E9E9E] mb-5">
        儲存後，下次結帳時會自動帶入收件資訊與物流偏好。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 space-y-4">
          <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D]">基本資料</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>姓名</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputCls}
                placeholder="王小明"
              />
            </div>
            <div>
              <label className={labelCls}>手機號碼</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputCls}
                placeholder="0912-345-678"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>常用收件地址</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => update('address', e.target.value)}
              className={inputCls}
              placeholder="台北市信義區..."
            />
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 space-y-4">
          <div>
            <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D]">物流偏好</h2>
            <p className="text-[12px] text-[#9E9E9E] mt-1">結帳時會以此為預設方式</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(SHIPPING_METHOD_LABEL) as ShippingMethod[]).map((m) => {
              const active = profile.defaultShippingMethod === m
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    update('defaultShippingMethod', m)
                    if (m === 'home_delivery') update('defaultShippingProvider', 'black_cat')
                    else if (profile.defaultShippingProvider === 'black_cat')
                      update('defaultShippingProvider', undefined)
                  }}
                  className={`rounded-[12px] border-2 px-4 py-3 text-[13px] text-left transition-all ${
                    active
                      ? 'border-[#7C9070] bg-[#7C9070]/5 text-[#2D2D2D]'
                      : 'border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#C8C8C8]'
                  }`}
                >
                  <div className="font-medium">{SHIPPING_METHOD_LABEL[m]}</div>
                  <div className="text-[11px] text-[#9E9E9E] mt-0.5">
                    {m === 'cvs_pickup' ? '7-11 / 全家' : '黑貓宅急便'}
                  </div>
                </button>
              )
            })}
          </div>

          {profile.defaultShippingMethod === 'cvs_pickup' && (
            <div>
              <label className={labelCls}>常用超商</label>
              <div className="flex gap-2">
                {CVS_PROVIDERS.map((p) => {
                  const active = cvsProviderValue === p.value
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => update('defaultShippingProvider', p.value)}
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
          )}
        </div>

        {error && (
          <div className="flex gap-2.5 bg-red-50 border border-red-100 rounded-[12px] p-4 text-[13px] text-red-500">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {savedAt && !error && (
          <div className="flex gap-2.5 bg-[#EBF1E8] border border-[#7C9070]/20 rounded-[12px] p-4 text-[13px] text-[#5C7A52]">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span>已儲存</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] px-6 py-4 rounded-[12px] transition-colors"
        >
          {saving ? '儲存中…' : '儲存設定'}
        </button>
      </form>
    </div>
  )
}
