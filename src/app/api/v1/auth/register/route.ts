import { NextRequest, NextResponse } from 'next/server'

// Mock 已存在帳號（避免重複註冊）
const EXISTING_EMAILS = new Set(['user@k-slect.com', 'test@k-slect.com'])

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password, name } = body as {
    email?: string
    password?: string
    name?: string
  }

  if (!email || !password) {
    return NextResponse.json(
      { data: null, error: { code: 'MISSING_FIELDS', message: '請填寫電子郵件與密碼' } },
      { status: 400 },
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { data: null, error: { code: 'WEAK_PASSWORD', message: '密碼至少需要 6 個字元' } },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (EXISTING_EMAILS.has(normalizedEmail)) {
    return NextResponse.json(
      { data: null, error: { code: 'EMAIL_EXISTS', message: '此電子郵件已被使用' } },
      { status: 409 },
    )
  }

  // Mock 成功建立帳號
  const displayName = name?.trim() || normalizedEmail.split('@')[0]

  const token = Buffer.from(
    JSON.stringify({ id: normalizedEmail, exp: Date.now() + 86400_000 }),
  ).toString('base64')

  const res = NextResponse.json(
    { data: { name: displayName, email: normalizedEmail }, error: null },
    { status: 201 },
  )

  res.cookies.set('user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })

  return res
}
