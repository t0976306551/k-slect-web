// bankReports.ts — 買家回報匯款資訊輸入驗證

export function sanitizeReportInput(
  raw: unknown,
): { last5: string; transferredAt: string | null; note: string | null } | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.last5 !== 'string') return null
  const last5 = r.last5.trim()
  if (!/^\d{5}$/.test(last5)) return null
  const transferredAt =
    typeof r.transferredAt === 'string' && r.transferredAt.trim() !== ''
      ? r.transferredAt.trim().slice(0, 32)
      : null
  const note =
    typeof r.note === 'string' && r.note.trim() !== '' ? r.note.trim().slice(0, 200) : null
  return { last5, transferredAt, note }
}
