import SuccessClient from './SuccessClient'

interface PageProps {
  searchParams: Promise<{ orderId?: string; total?: string }>
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { orderId, total: totalParam } = await searchParams
  const displayOrderId = orderId ?? 'ORD-XXXXXXX'
  const total = parseInt(totalParam ?? '0')

  return <SuccessClient orderId={displayOrderId} total={total} />
}


