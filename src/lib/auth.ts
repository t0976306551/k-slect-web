// auth.ts — 伺服器端 session 驗證輔助

import { NextRequest, NextResponse } from 'next/server'

type TokenPayload = {
  id: string
  exp: number
  isAdmin?: boolean
}

export function parseUserToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload
    if (!payload.id || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

/**
 * 驗證請求是否來自管理員。
 * 有問題時回傳 401/403 NextResponse，驗證通過時回傳 null。
 *
 * 用法：
 *   const authError = requireAdmin(req)
 *   if (authError) return authError
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get('user_token')?.value
  if (!token) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
      { status: 401 },
    )
  }
  const payload = parseUserToken(token)
  if (!payload?.isAdmin) {
    return NextResponse.json(
      { data: null, error: { code: 'FORBIDDEN', message: '需要管理員權限' } },
      { status: 403 },
    )
  }
  return null
}
