/**
 * Facebook OAuth 流程
 *
 * GET  /api/v1/promotions/facebook/oauth  — 產生授權 URL（導向 Facebook 登入）
 * POST /api/v1/promotions/facebook/oauth  — 處理授權回調（code → access token）
 *
 * 前置條件：Meta App Review 通過，且已設定 FACEBOOK_APP_ID、FACEBOOK_APP_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError, ValidationError } from '@/lib/errors'
import { buildOAuthUrl, exchangeCodeForToken, exchangeLongLivedToken, listPages } from '@/lib/facebook'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null })
}

function fail(e: unknown): NextResponse<ApiError> {
  if (e instanceof AppError) {
    return NextResponse.json(
      { data: null, error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    )
  }
  console.error('[Facebook OAuth Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const callbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
})

/** GET — 產生授權 URL */
export async function GET(req: NextRequest) {
  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/promotions/facebook/oauth`
    const state = crypto.randomBytes(16).toString('hex')

    const authUrl = buildOAuthUrl(redirectUri, state)

    return ok({ authUrl, state })
  } catch (e) {
    return fail(e)
  }
}

/** POST — 授權碼換 token，並取得粉絲專頁列表 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const result = callbackSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const { code } = result.data
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/promotions/facebook/oauth`

    const shortToken = await exchangeCodeForToken(code, redirectUri)
    const longToken = await exchangeLongLivedToken(shortToken)
    const pages = await listPages(longToken)

    return ok({ longToken, pages })
  } catch (e) {
    return fail(e)
  }
}
