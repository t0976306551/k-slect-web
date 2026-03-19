export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from './ProductDetailClient'

type Props = { params: Promise<{ id: string }> }

const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      price: true,
      category: { select: { name: true, slug: true } },
    },
  })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description ?? undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'TWD',
          availability:
            'https://schema.org/InStock',
          url: `${SITE_URL}/products/${id}`,
        },
      }
    : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '所有商品', item: `${SITE_URL}/products` },
      ...(product
        ? [{ '@type': 'ListItem', position: 3, name: product.name }]
        : []),
    ],
  }

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetailClient />
    </>
  )
}
