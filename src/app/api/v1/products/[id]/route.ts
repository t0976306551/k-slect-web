import { NextRequest, NextResponse } from 'next/server'
import { storefrontRequest, backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const result = await storefrontRequest(`/products/${id}`)
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
