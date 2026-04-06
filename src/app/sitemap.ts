import type { MetadataRoute } from 'next'
import { storefrontRequest } from '@/lib/backend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

type ProductItem = { id: string; slug: string | null; updatedAt: string }
type CategoryItem = { slug: string; updatedAt: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsResult, categoriesResult] = await Promise.all([
    storefrontRequest<ProductItem[]>('/products?status=active&limit=500'),
    storefrontRequest<CategoryItem[]>('/categories'),
  ])

  const products = productsResult.data ?? []
  const categories = categoriesResult.data ?? []

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(cat.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug ?? product.id}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
