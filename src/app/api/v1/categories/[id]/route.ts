import { NextRequest, NextResponse } from 'next/server'
import { storefrontRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const result = await storefrontRequest(`/categories/${id}`)
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
