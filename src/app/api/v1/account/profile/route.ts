import { NextRequest, NextResponse } from 'next/server'
import {
  PROFILE_COOKIE_NAME,
  PROFILE_COOKIE_MAX_AGE,
  decodeProfile,
  emptyProfile,
  encodeProfile,
  getCurrentUserEmail,
  sanitizeProfilePatch,
} from '@/lib/profile'
import { storefrontRequest } from '@/lib/backend'
import type { MemberProfile } from '@/types'

export const dynamic = 'force-dynamic'

interface BackendMember {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
}

function unauthorized() {
  return NextResponse.json(
    { data: null, error: { code: 'UNAUTHORIZED', message: '尚未登入' } },
    { status: 401 },
  )
}

function mergeWithBackend(
  email: string,
  backend: BackendMember | null,
  cookieProfile: MemberProfile | null,
): MemberProfile {
  const base = backend
    ? {
        name: backend.name ?? '',
        email: backend.email ?? email,
        phone: backend.phone ?? '',
        address: backend.address ?? '',
      }
    : emptyProfile(email)
  return {
    ...base,
    defaultShippingMethod: cookieProfile?.defaultShippingMethod,
    defaultShippingProvider: cookieProfile?.defaultShippingProvider,
  }
}

export async function GET(req: NextRequest) {
  const email = getCurrentUserEmail(req)
  if (!email) return unauthorized()

  const backendRes = await storefrontRequest<BackendMember>(
    `/members/me?email=${encodeURIComponent(email)}`,
  )

  const cookieValue = req.cookies.get(PROFILE_COOKIE_NAME)?.value
  const stored = cookieValue ? decodeProfile(cookieValue) : null
  const cookieProfile = stored && stored.email === email ? stored : null

  const profile = mergeWithBackend(email, backendRes.data, cookieProfile)
  return NextResponse.json({ data: profile, error: null })
}

export async function PATCH(req: NextRequest) {
  const email = getCurrentUserEmail(req)
  if (!email) return unauthorized()

  const raw: unknown = await req.json().catch(() => null)
  const patch = sanitizeProfilePatch(raw)
  if (!patch) {
    return NextResponse.json(
      { data: null, error: { code: 'VALIDATION_ERROR', message: '欄位格式錯誤' } },
      { status: 400 },
    )
  }

  // 1) Sync core fields (name/phone/address) to backend
  const corePatch: Record<string, unknown> = { email }
  if (patch.name !== undefined) corePatch.name = patch.name
  if (patch.phone !== undefined) corePatch.phone = patch.phone || null
  if (patch.address !== undefined) corePatch.address = patch.address || null

  const backendRes = await storefrontRequest<BackendMember>('/members/me', {
    method: 'PATCH',
    body: JSON.stringify(corePatch),
  })

  if (backendRes.error) {
    return NextResponse.json(
      { data: null, error: backendRes.error },
      { status: 502 },
    )
  }

  // 2) Persist UI prefs (defaultShippingMethod/Provider) in cookie
  const cookieValue = req.cookies.get(PROFILE_COOKIE_NAME)?.value
  const existing = cookieValue ? decodeProfile(cookieValue) : null
  const existingPrefs = existing && existing.email === email ? existing : null

  const merged: MemberProfile = mergeWithBackend(email, backendRes.data, existingPrefs)
  if (patch.defaultShippingMethod !== undefined) {
    merged.defaultShippingMethod = patch.defaultShippingMethod
  }
  if (patch.defaultShippingProvider !== undefined) {
    merged.defaultShippingProvider = patch.defaultShippingProvider
  }

  const res = NextResponse.json({ data: merged, error: null })
  res.cookies.set(PROFILE_COOKIE_NAME, encodeProfile(merged), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PROFILE_COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
