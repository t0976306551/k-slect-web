// profile.ts — 前台會員 profile 暫存於 httpOnly cookie
// （第一階段先以 cookie 為持久層；待 backend members 整合後可改接真實 API）

import type { NextRequest } from 'next/server'
import type { MemberProfile, ShippingMethod, ShippingProvider } from '@/types'
import { parseUserToken } from './auth'

export const PROFILE_COOKIE_NAME = 'user_profile'
export const PROFILE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 年

const SHIPPING_METHODS: readonly ShippingMethod[] = ['cvs_pickup', 'home_delivery']
const SHIPPING_PROVIDERS: readonly ShippingProvider[] = [
  'seven_eleven',
  'family_mart',
  'black_cat',
]

export function emptyProfile(email: string, name?: string): MemberProfile {
  return {
    name: name ?? email.split('@')[0],
    email,
    phone: '',
    address: '',
  }
}

export function encodeProfile(profile: MemberProfile): string {
  return Buffer.from(JSON.stringify(profile), 'utf-8').toString('base64')
}

export function decodeProfile(value: string): MemberProfile | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf-8')) as Partial<MemberProfile>
    if (typeof parsed !== 'object' || parsed === null) return null
    if (typeof parsed.email !== 'string') return null
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: parsed.email,
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      address: typeof parsed.address === 'string' ? parsed.address : '',
      defaultShippingMethod:
        typeof parsed.defaultShippingMethod === 'string' &&
        (SHIPPING_METHODS as readonly string[]).includes(parsed.defaultShippingMethod)
          ? (parsed.defaultShippingMethod as ShippingMethod)
          : undefined,
      defaultShippingProvider:
        typeof parsed.defaultShippingProvider === 'string' &&
        (SHIPPING_PROVIDERS as readonly string[]).includes(parsed.defaultShippingProvider)
          ? (parsed.defaultShippingProvider as ShippingProvider)
          : undefined,
    }
  } catch {
    return null
  }
}

function readProfileFromRequest(req: NextRequest): MemberProfile | null {
  const value = req.cookies.get(PROFILE_COOKIE_NAME)?.value
  if (!value) return null
  return decodeProfile(value)
}

export function getCurrentUserEmail(req: NextRequest): string | null {
  const token = req.cookies.get('user_token')?.value
  if (!token) return null
  const payload = parseUserToken(token)
  return payload?.id ?? null
}

export function sanitizeProfilePatch(
  raw: unknown,
): Partial<Omit<MemberProfile, 'email'>> | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const out: Partial<Omit<MemberProfile, 'email'>> = {}
  if ('name' in r) {
    if (typeof r.name !== 'string') return null
    out.name = r.name.trim().slice(0, 50)
  }
  if ('phone' in r) {
    if (typeof r.phone !== 'string') return null
    out.phone = r.phone.trim().slice(0, 30)
  }
  if ('address' in r) {
    if (typeof r.address !== 'string') return null
    out.address = r.address.trim().slice(0, 200)
  }
  if ('defaultShippingMethod' in r && r.defaultShippingMethod !== undefined) {
    if (
      typeof r.defaultShippingMethod !== 'string' ||
      !(SHIPPING_METHODS as readonly string[]).includes(r.defaultShippingMethod)
    ) {
      return null
    }
    out.defaultShippingMethod = r.defaultShippingMethod as ShippingMethod
  }
  if ('defaultShippingProvider' in r && r.defaultShippingProvider !== undefined) {
    if (
      typeof r.defaultShippingProvider !== 'string' ||
      !(SHIPPING_PROVIDERS as readonly string[]).includes(r.defaultShippingProvider)
    ) {
      return null
    }
    out.defaultShippingProvider = r.defaultShippingProvider as ShippingProvider
  }
  return out
}
