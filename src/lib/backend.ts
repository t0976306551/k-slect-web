// backend.ts — 代理 k-slect-backend API 呼叫

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001/api'
const BACKEND_SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ''

type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } }

/**
 * 帶 service token 呼叫後台（給需要 admin 權限的路由用）
 */
export async function backendRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(BACKEND_SERVICE_TOKEN ? { Authorization: `Bearer ${BACKEND_SERVICE_TOKEN}` } : {}),
    ...(init?.headers as Record<string, string> | undefined ?? {}),
  }

  const res = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(30_000),
  })

  const json = await res.json()

  // 後台回傳非 2xx 時，確保格式符合 ApiResponse
  if (!res.ok && !json.error) {
    return { data: null, error: { code: 'BACKEND_ERROR', message: `Backend responded with ${res.status}` } }
  }

  return json as ApiResponse<T>
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

  const res = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(30_000),
  })

  const json = await res.json()

  if (!res.ok && !json.error) {
    return { data: null, error: { code: 'BACKEND_ERROR', message: `Backend responded with ${res.status}` } }
  }

  return json as ApiResponse<T>
}
