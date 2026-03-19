export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CategoryClient from './CategoryClient'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  })

  if (!category) {
    return { title: '分類不存在', robots: { index: false } }
  }

  return {
    title: `${category.name} - 韓貨嚴選`,
    description: `K-slect 精選${category.name}，正品直送台灣。`,
    alternates: { canonical: `/category/${slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!category) notFound()

  return <CategoryClient />
}
