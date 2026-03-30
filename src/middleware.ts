import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/account']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('user_token')?.value
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 驗證 token 格式與過期時間
  try {
    const payload = JSON.parse(atob(token))
    if (!payload.id || Date.now() > payload.exp) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('from', pathname)
      const res = NextResponse.redirect(loginUrl)
      res.cookies.delete('user_token')
      return res
    }
  } catch {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*'],
}
