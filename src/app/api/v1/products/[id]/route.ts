import { NextRequest, NextResponse } from 'next/server'
import { storefrontRequest, backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const result = await storefrontRequest<Record<string, unknown>>(`/products/${id}`)
  if (result.data) {
    const images = result.data.images
    const product = { ...result.data, image: Array.isArray(images) ? (images[0] ?? null) : null }
    return NextResponse.json({ data: product, error: null }, { status: 200 })
  }
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const result = await backendRequest(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const result = await backendRequest(`/products/${id}`, { method: 'DELETE' })
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}
