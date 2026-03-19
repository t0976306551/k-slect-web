/**
 * Facebook Graph API 整合
 *
 * 前置條件：
 * 1. 至 https://developers.facebook.com 建立 Business App
 * 2. 申請 pages_manage_posts 與 pages_read_engagement 權限
 * 3. 通過 Meta App Review（審核需 2–4 週）
 * 4. 在 .env 設定 FACEBOOK_APP_ID、FACEBOOK_APP_SECRET
 *
 * 文件：https://developers.facebook.com/docs/graph-api
 */

import { AppError } from './errors'

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'
const APP_ID = process.env.FACEBOOK_APP_ID
const APP_SECRET = process.env.FACEBOOK_APP_SECRET

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
}

export interface FacebookPostPayload {
  message: string
  link?: string
  /** UNIX timestamp（需 scheduled_publish_time + published: false） */
  scheduledAt?: number
}

export interface FacebookCarouselItem {
  name: string
  description: string
  link: string
  picture?: string
}

export interface FacebookGraphError {
  error: {
    message: string
    type: string
    code: number
    fbtrace_id: string
  }
}

/** 取得長效用戶 access token（短效 token → 長效 token） */
export async function exchangeLongLivedToken(shortLivedToken: string): Promise<string> {
  if (!APP_ID || !APP_SECRET) {
    throw new AppError('Facebook App 尚未設定', 'FB_CONFIG_MISSING', 500)
  }

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', APP_ID)
  url.searchParams.set('client_secret', APP_SECRET)
  url.searchParams.set('fb_exchange_token', shortLivedToken)

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })
  const data = await res.json() as { access_token?: string } & FacebookGraphError

  if (!res.ok || !data.access_token) {
    throw new AppError(
      data.error?.message ?? '取得長效 token 失敗',
      'FB_TOKEN_EXCHANGE_FAILED',
      502,
    )
  }

  return data.access_token
}

/** 列出用戶授權的粉絲專頁 */
export async function listPages(userAccessToken: string): Promise<FacebookPage[]> {
  const url = new URL(`${GRAPH_API_BASE}/me/accounts`)
  url.searchParams.set('access_token', userAccessToken)
  url.searchParams.set('fields', 'id,name,access_token,category')

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })
  const data = await res.json() as { data?: FacebookPage[] } & FacebookGraphError

  if (!res.ok) {
    throw new AppError(
      data.error?.message ?? '取得粉絲專頁列表失敗',
      'FB_PAGES_FETCH_FAILED',
      502,
    )
  }

  return data.data ?? []
}

/** 發佈單一圖文貼文到粉絲專頁 */
export async function createPagePost(
  pageId: string,
  pageAccessToken: string,
  payload: FacebookPostPayload,
): Promise<string> {
  const body: Record<string, unknown> = {
    message: payload.message,
    access_token: pageAccessToken,
  }

  if (payload.link) body.link = payload.link

  if (payload.scheduledAt) {
    body.published = false
    body.scheduled_publish_time = payload.scheduledAt
  }

  const res = await fetch(`${GRAPH_API_BASE}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })

  const data = await res.json() as { id?: string } & FacebookGraphError

  if (!res.ok || !data.id) {
    throw new AppError(
      data.error?.message ?? '發佈貼文失敗',
      'FB_POST_FAILED',
      502,
    )
  }

  return data.id
}

/** 發佈輪播貼文（多商品）到粉絲專頁 */
export async function createCarouselPost(
  pageId: string,
  pageAccessToken: string,
  message: string,
  items: FacebookCarouselItem[],
): Promise<string> {
  if (items.length < 2 || items.length > 10) {
    throw new AppError('輪播貼文需 2–10 個項目', 'FB_CAROUSEL_INVALID_COUNT', 400)
  }

  const body = {
    message,
    access_token: pageAccessToken,
    child_attachments: items.map((item) => ({
      link: item.link,
      name: item.name,
      description: item.description,
      picture: item.picture,
    })),
    multi_share_end_card: false,
  }

  const res = await fetch(`${GRAPH_API_BASE}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })

  const data = await res.json() as { id?: string } & FacebookGraphError

  if (!res.ok || !data.id) {
    throw new AppError(
      data.error?.message ?? '發佈輪播貼文失敗',
      'FB_CAROUSEL_FAILED',
      502,
    )
  }

  return data.id
}

/** 建立 Facebook OAuth 授權 URL（讓賣家授權 K-slect App 存取其粉絲專頁） */
export function buildOAuthUrl(redirectUri: string, state: string): string {
  if (!APP_ID) {
    throw new AppError('Facebook App ID 未設定', 'FB_CONFIG_MISSING', 500)
  }

  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  url.searchParams.set('client_id', APP_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list')
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')

  return url.toString()
}

/** 用授權碼換取 access token */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  if (!APP_ID || !APP_SECRET) {
    throw new AppError('Facebook App 尚未設定', 'FB_CONFIG_MISSING', 500)
  }

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
  url.searchParams.set('client_id', APP_ID)
  url.searchParams.set('client_secret', APP_SECRET)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('code', code)

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })
  const data = await res.json() as { access_token?: string } & FacebookGraphError

  if (!res.ok || !data.access_token) {
    throw new AppError(
      data.error?.message ?? '換取 access token 失敗',
      'FB_CODE_EXCHANGE_FAILED',
      502,
    )
  }

  return data.access_token
}
