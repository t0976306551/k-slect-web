import { STATUS_BG, STATUS_COLOR, STATUS_LABEL } from '@/lib/order-constants'

interface StatusBadgeProps {
  readonly status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
      style={{
        background: STATUS_BG[status] ?? '#F0F0F0',
        color: STATUS_COLOR[status] ?? '#6B6B6B',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: STATUS_COLOR[status] ?? '#6B6B6B' }}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
