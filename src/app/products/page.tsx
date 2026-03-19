export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: '所有商品',
  description: '瀏覽 K-slect 嚴選韓貨，包含 K-beauty 美妝保養、韓系服飾、韓國食品等精選商品。',
  openGraph: {
    title: '所有商品 | K-slect 韓貨嚴選',
    description: '瀏覽 K-slect 嚴選韓貨，包含 K-beauty 美妝保養、韓系服飾、韓國食品等精選商品。',
    url: '/products',
  },
}

export default function ProductsPage() {
  return <ProductsClient />
}
