// backend.ts — 代理 k-slect-backend API 呼叫

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001/api'
const BACKEND_ADMIN_EMAIL = process.env.BACKEND_ADMIN_EMAIL ?? ''
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD ?? ''

// 快取 service token；初始值來自 env，401 時自動刷新
let cachedServiceToken = process.env.BACKEND_SERVICE_TOKEN ?? ''

/**
 * 使用 admin 帳號重新登入後台，更新 cachedServiceToken。
 * 若未設定管理員帳密則不做任何事，讓呼叫端繼續回傳 401。
 */
async function refreshServiceToken(): Promise<boolean> {
  if (!BACKEND_ADMIN_EMAIL || !BACKEND_ADMIN_PASSWORD) return false

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: BACKEND_ADMIN_EMAIL, password: BACKEND_ADMIN_PASSWORD }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return false

    const json = (await res.json()) as { data?: { token?: string } }
    const newToken = json?.data?.token
    if (!newToken) return false

    cachedServiceToken = newToken
    return true
  } catch {
    return false
  }
}

type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } }

async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') ?? ''
  const bodyText = await res.text()

  if (!bodyText) {
    return res.ok
      ? ({ data: null, error: { code: 'EMPTY_RESPONSE', message: 'Backend returned an empty response body' } } as ApiResponse<T>)
      : { data: null, error: { code: 'BACKEND_ERROR', message: `Backend responded with ${res.status}` } }
  }

  if (!contentType.includes('application/json')) {
    return {
      data: null,
      error: {
        code: 'INVALID_RESPONSE_CONTENT_TYPE',
        message: `Expected JSON from backend but received ${contentType || 'unknown content type'}`,
      },
    }
  }

  let json: unknown

  try {
    json = JSON.parse(bodyText)
  } catch {
    return {
      data: null,
      error: {
        code: 'INVALID_JSON_RESPONSE',
        message: 'Backend returned invalid JSON',
      },
    }
  }

  if (!res.ok && (!(json && typeof json === 'object' && 'error' in json) || !(json as { error?: unknown }).error)) {
    return { data: null, error: { code: 'BACKEND_ERROR', message: `Backend responded with ${res.status}` } }
  }

  return json as ApiResponse<T>
}

/**
 * 帶 service token 呼叫後台（給需要 admin 權限的路由用）。
 * 若後台回傳 401，會自動嘗試以管理員帳密重新取得 token 後重試一次。
 */
export async function backendRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${path}`

  const makeHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(cachedServiceToken ? { Authorization: `Bearer ${cachedServiceToken}` } : {}),
    ...(init?.headers as Record<string, string> | undefined ?? {}),
  })

  try {
    const res = await fetch(url, { ...init, headers: makeHeaders(), signal: AbortSignal.timeout(30_000) })

    // Token 過期：嘗試刷新後重試一次
    if (res.status === 401) {
      const refreshed = await refreshServiceToken()
      if (refreshed) {
        const retryRes = await fetch(url, { ...init, headers: makeHeaders(), signal: AbortSignal.timeout(30_000) })
        return parseApiResponse<T>(retryRes)
      }
    }

    return parseApiResponse<T>(res)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: { code: 'NETWORK_ERROR', message } }
  }
}

/**
 * 公開端點呼叫（storefront，不需要 token）
 */
export async function storefrontRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}/storefront${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined ?? {}),
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(30_000),
    })
    return parseApiResponse<T>(res)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: { code: 'NETWORK_ERROR', message } }
  }
}
