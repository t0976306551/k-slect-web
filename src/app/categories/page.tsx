import type { Metadata } from 'next'
import CategoriesClient from './CategoriesClient'

export const metadata: Metadata = {
  title: '商品分類 | 韓好物',
  description: '瀏覽韓好物所有商品分類：美妝保養、食品零食、服飾配件等韓國直送嚴選好物。',
}

export default function CategoriesPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-8 md:py-12">
      <CategoriesClient />
    </main>
  )
}
