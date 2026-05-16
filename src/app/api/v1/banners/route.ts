import { NextResponse } from 'next/server'
import { storefrontRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await storefrontRequest('/banners')
  const status = result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
