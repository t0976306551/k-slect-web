import { NextRequest, NextResponse } from 'next/server'
import { parseUserToken } from '@/lib/auth'

const USER_PATHS = ['/account']
const ADMIN_PATHS = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isUserPath = USER_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isAdminPath = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isUserPath && !isAdminPath) return NextResponse.next()

  const token = req.cookies.get('user_token')?.value
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = parseUserToken(token)
  if (!payload) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('user_token')
    return res
  }

  if (isAdminPath && !payload.isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
