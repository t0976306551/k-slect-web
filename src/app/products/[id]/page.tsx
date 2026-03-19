export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from './ProductDetailClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true, price: true },
  })

  if (!product) {
    return {
      title: '商品不存在',
      robots: { index: false },
    }
  }

  const descriptionText = product.description
    ? `${product.description.slice(0, 100)} `
    : ''
  const description = `${product.name} 正品直送，台灣現貨快速出貨。NT$${product.price.toLocaleString('zh-TW')} 起！${descriptionText}`

  return {
    title: `${product.name} - 正品韓貨`,
    description,
    openGraph: {
      title: `${product.name} | K-slect 韓貨嚴選`,
      description: product.description ?? description,
      type: 'website',
      url: `/products/${id}`,
    },
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
