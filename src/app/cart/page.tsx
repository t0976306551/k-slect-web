export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = {
  title: '購物車',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartClient />
}
