export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CategoryClient from './CategoryClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { title: '商品分類 - 韓貨嚴選' }
  }
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
    select: { name: true },
  })
  if (!category) return { title: '分類不存在', robots: { index: false } }
  return {
    title: `${category.name} - 韓貨嚴選`,
    description: `K-slect 精選${category.name}，正品直送台灣。`,
    alternates: { canonical: `/category/${id}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params

  if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
    const exists = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!exists) notFound()
  }

  return <CategoryClient />
}
