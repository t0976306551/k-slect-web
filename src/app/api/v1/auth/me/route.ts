import { NextRequest, NextResponse } from 'next/server'

const MOCK_USERS: Record<string, { name: string; email: string }> = {
  'user@k-slect.com': { name: '測試用戶', email: 'user@k-slect.com' },
  'test@k-slect.com': { name: 'Test User', email: 'test@k-slect.com' },
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value

  if (!token) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: '尚未登入' } },
      { status: 401 },
    )
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    if (!payload.id || Date.now() > payload.exp) {
      const res = NextResponse.json(
        { data: null, error: { code: 'TOKEN_EXPIRED', message: '登入已過期' } },
        { status: 401 },
      )
      res.cookies.delete('user_token')
      return res
    }

    const user = MOCK_USERS[payload.id] ?? { name: payload.id.split('@')[0], email: payload.id }
    return NextResponse.json({ data: user, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_TOKEN', message: 'Token 無效' } },
      { status: 401 },
    )
  }
}
