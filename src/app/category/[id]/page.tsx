export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { storefrontRequest } from '@/lib/backend'
import HomeProductsSection from '@/components/HomeProductsSection'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { title: '商品分類 - 韓貨嚴選' }
  }
  const { id } = await params
  const result = await storefrontRequest<{ id: string; name: string }>(`/categories/${id}`)
  if (result.error) return { title: '分類不存在', robots: { index: false } }
  return {
    title: `${result.data.name} - 韓貨嚴選`,
    description: `K-slect 精選${result.data.name}，正品直送台灣。`,
    alternates: { canonical: `/category/${id}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params

  if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
    const result = await storefrontRequest<{ id: string }>(`/categories/${id}`)
    if (result.error?.code === 'NOT_FOUND' || !result.data) notFound()
  }

  return (
    <Suspense>
      <HomeProductsSection defaultCategory={id} />
    </Suspense>
  )
}
