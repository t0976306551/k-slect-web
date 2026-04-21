// backend.ts — 代理 k-slect-backend API 呼叫

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001/api'
const BACKEND_SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ''

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

  return parseApiResponse<T>(res)
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

  return parseApiResponse<T>(res)
}
