import { NextRequest, NextResponse } from 'next/server'
import { parseUserToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value
  const payload = token ? parseUserToken(token) : null

  if (!payload?.isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
