import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

const patchCustomerSchema = z.object({
  status: z.enum(['active', 'inactive', 'blacklisted', 'vip']).optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  const raw: unknown = await req.json().catch(() => null)
  const parsed = patchCustomerSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join('; ') } },
      { status: 400 },
    )
  }

  const result = await backendRequest(`/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(parsed.data),
  })
  const status = result.error?.code === 'NOT_FOUND' ? 404 : result.error ? 500 : 200
  return NextResponse.json(result, { status })
}
