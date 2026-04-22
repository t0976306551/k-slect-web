import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(
  status: number,
  body: unknown,
  contentType = 'application/json',
): Response {
  const bodyStr = body === null || body === undefined ? '' : JSON.stringify(body)
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? contentType : null,
    },
    text: () => Promise.resolve(bodyStr),
    json: () => Promise.resolve(body),
  } as unknown as Response
}

function makeEmptyResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(''),
    json: () => Promise.resolve(null),
  } as unknown as Response
}

function makeNonJsonResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'text/html' },
    text: () => Promise.resolve('<html>error</html>'),
    json: () => Promise.reject(new Error('not json')),
  } as unknown as Response
}

function makeInvalidJsonResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve('{invalid json}'),
    json: () => Promise.reject(new Error('not json')),
  } as unknown as Response
}

// ---------------------------------------------------------------------------
// backendRequest — simple cases (no env-var reset needed)
// ---------------------------------------------------------------------------

describe('backendRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns data on 200 success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeFetchResponse(200, { data: { id: 1 }, error: null })),
    )

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/items')

    expect(result).toEqual({ data: { id: 1 }, error: null })
  })

  it('returns NETWORK_ERROR when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/items')

    expect(result).toEqual({
      data: null,
      error: { code: 'NETWORK_ERROR', message: 'fetch failed' },
    })
  })

  it('returns EMPTY_RESPONSE error when 200 with empty body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeEmptyResponse(200)))

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/items')

    expect(result).toEqual({
      data: null,
      error: { code: 'EMPTY_RESPONSE', message: expect.any(String) },
    })
  })

  it('returns INVALID_RESPONSE_CONTENT_TYPE when content-type is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeNonJsonResponse(200)))

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/items')

    expect(result).toEqual({
      data: null,
      error: { code: 'INVALID_RESPONSE_CONTENT_TYPE', message: expect.any(String) },
    })
  })

  it('returns INVALID_JSON_RESPONSE when body is malformed JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeInvalidJsonResponse(200)))

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/items')

    expect(result).toEqual({
      data: null,
      error: { code: 'INVALID_JSON_RESPONSE', message: expect.any(String) },
    })
  })

  it('returns 401 error response when no admin creds are set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeFetchResponse(401, { data: null, error: { code: 'UNAUTHORIZED', message: 'unauthorized' } }),
      ),
    )

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/secret')

    expect(result).toEqual({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'unauthorized' },
    })
    // Only one fetch call — no refresh attempt
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// backendRequest — 401 auto-refresh (needs env-var reset per test)
// ---------------------------------------------------------------------------

describe('backendRequest — 401 auto-refresh', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete process.env.BACKEND_ADMIN_EMAIL
    delete process.env.BACKEND_ADMIN_PASSWORD
  })

  it('refreshes token on 401 and retries — returns data on success', async () => {
    process.env.BACKEND_ADMIN_EMAIL = 'admin@test.com'
    process.env.BACKEND_ADMIN_PASSWORD = 'pass'

    const mockFetch = vi
      .fn()
      // 1st call: original endpoint → 401
      .mockResolvedValueOnce(
        makeFetchResponse(401, { data: null, error: { code: 'UNAUTHORIZED', message: 'unauthorized' } }),
      )
      // 2nd call: /auth/login → 200 with new token
      .mockResolvedValueOnce(
        makeFetchResponse(200, { data: { token: 'new-token' } }),
      )
      // 3rd call: retry of original endpoint → 200 with data
      .mockResolvedValueOnce(
        makeFetchResponse(200, { data: { id: 42 }, error: null }),
      )

    vi.stubGlobal('fetch', mockFetch)

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/secret')

    expect(result).toEqual({ data: { id: 42 }, error: null })
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('returns original 401 error when login fails (admin creds present but login returns 400)', async () => {
    process.env.BACKEND_ADMIN_EMAIL = 'admin@test.com'
    process.env.BACKEND_ADMIN_PASSWORD = 'pass'

    const mockFetch = vi
      .fn()
      // 1st call: original endpoint → 401
      .mockResolvedValueOnce(
        makeFetchResponse(401, { data: null, error: { code: 'UNAUTHORIZED', message: 'unauthorized' } }),
      )
      // 2nd call: /auth/login → 400 (login failure)
      .mockResolvedValueOnce(
        makeFetchResponse(400, { data: null, error: { code: 'BAD_REQUEST', message: 'bad request' } }),
      )

    vi.stubGlobal('fetch', mockFetch)

    const { backendRequest } = await import('../backend')
    const result = await backendRequest('/secret')

    expect(result).toEqual({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'unauthorized' },
    })
    // No third retry since refresh failed
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// storefrontRequest
// ---------------------------------------------------------------------------

describe('storefrontRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns data on 200 success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeFetchResponse(200, { data: { slug: 'hello' }, error: null })),
    )

    const { storefrontRequest } = await import('../backend')
    const result = await storefrontRequest('/products')

    expect(result).toEqual({ data: { slug: 'hello' }, error: null })
  })

  it('returns NETWORK_ERROR when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const { storefrontRequest } = await import('../backend')
    const result = await storefrontRequest('/products')

    expect(result).toEqual({
      data: null,
      error: { code: 'NETWORK_ERROR', message: 'fetch failed' },
    })
  })

  it('calls fetch with URL containing /storefront/ prefix', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(makeFetchResponse(200, { data: {}, error: null }))
    vi.stubGlobal('fetch', mockFetch)

    const { storefrontRequest } = await import('../backend')
    await storefrontRequest('/products')

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/storefront/')
  })
})
