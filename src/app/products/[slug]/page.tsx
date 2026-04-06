export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { permanentRedirect, notFound } from 'next/navigation'
import { cache } from 'react'
import { isCuid } from '@/lib/slug'
import ProductDetailClient from './ProductDetailClient'
import { mockFetchProduct } from '@/lib/mock-handlers'

type Props = { params: Promise<{ slug: string }> }

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const getProduct = cache(async (idOrSlug: string) => {
  if (USE_MOCK) {
    const res = await mockFetchProduct(idOrSlug)
    if (res.error || !res.data) return null
    return {
      id: res.data.id,
      slug: res.data.slug,
      name: res.data.name,
      description: res.data.description,
      price: res.data.price,
      category: null as { name: string; slug: string | null } | null,
    }
  }
  const { storefrontRequest } = await import('@/lib/backend')
  const res = await storefrontRequest<{
    id: string; slug: string | null; name: string; description: string | null; price: number;
    category?: { name: string; slug: string | null } | null
  }>(`/products/${idOrSlug}`)
  if (res.error || !res.data) return null
  return res.data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

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
  const canonicalSlug = product.slug ?? slug

  return {
    title: `${product.name} - 正品韓貨`,
    description,
    alternates: { canonical: `/products/${canonicalSlug}` },
    openGraph: {
      title: `${product.name} | K-slect 韓貨嚴選`,
      description: product.description ?? description,
      type: 'website',
      url: `/products/${canonicalSlug}`,
    },
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  // 舊 cuid URL → 永久 redirect 到 slug URL（mock 模式下跳過）
  if (!USE_MOCK && isCuid(slug)) {
    const { storefrontRequest } = await import('@/lib/backend')
    const res = await storefrontRequest<{ slug: string | null }>(`/products/${slug}`)
    if (!res.data) notFound()
    if (res.data.slug) {
      permanentRedirect(`/products/${res.data.slug}`)
    }
  }

  const product = await getProduct(slug)

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
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/products/${product.slug ?? slug}`,
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
