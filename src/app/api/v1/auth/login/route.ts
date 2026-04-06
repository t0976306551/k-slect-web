import { NextRequest, NextResponse } from 'next/server'

// Mock 使用者帳號
const MOCK_USERS = [
  { email: 'user@k-slect.com', password: 'password123', name: '測試用戶', isAdmin: false },
  { email: 'test@k-slect.com', password: 'test123', name: 'Test User', isAdmin: false },
  { email: 'admin@k-slect.com', password: 'admin123', name: '管理員', isAdmin: true },
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json(
      { data: null, error: { code: 'MISSING_FIELDS', message: '請填寫電子郵件與密碼' } },
      { status: 400 },
    )
  }

  const user = MOCK_USERS.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password,
  )

  if (!user) {
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_CREDENTIALS', message: '電子郵件或密碼錯誤' } },
      { status: 401 },
    )
  }

  const token = Buffer.from(
    JSON.stringify({ id: user.email, exp: Date.now() + 86400_000, isAdmin: user.isAdmin }),
  ).toString('base64')

  const res = NextResponse.json({
    data: { name: user.name, email: user.email },
    error: null,
  })

  res.cookies.set('user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })

  return res
}
