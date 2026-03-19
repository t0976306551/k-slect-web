import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'active' },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ])

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
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    // ALA-39 完成後，slug 會全部有值，屆時換成 /products/${product.slug}
    url: `${SITE_URL}/products/${product.slug ?? product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
