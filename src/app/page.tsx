import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'K-slect 韓貨嚴選 | 台灣最值得信賴的韓貨電商',
  description: 'K-slect 嚴選正品韓貨，涵蓋韓國美妝、零食、服飾、偶像周邊。台灣現貨，快速出貨。',
  openGraph: {
    title: 'K-slect 韓貨嚴選 | 台灣最值得信賴的韓貨電商',
    description: 'K-slect 嚴選正品韓貨，涵蓋韓國美妝、零食、服飾、偶像周邊。台灣現貨，快速出貨。',
    type: 'website',
    url: '/',
  },
}

export default function HomePage() {
  const categories = [
    { name: 'K-Beauty', emoji: '💄', slug: 'k-beauty', desc: '護膚、彩妝、保養' },
    { name: '韓系服飾', emoji: '👗', slug: 'fashion', desc: '潮流穿搭、配件' },
    { name: '韓國食品', emoji: '🍜', slug: 'food', desc: '零食、泡麵、調料' },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 text-center">
        <div className="text-6xl mb-4">🇰🇷</div>
        <h1 className="text-4xl font-bold text-purple-800 mb-3">
          K-slect 韓貨嚴選
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          精選韓國好物，直送台灣你家
        </p>
        <Link
          href="/products"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          立即逛逛
        </Link>
      </section>

      {/* 分類區塊 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">熱門分類</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-center"
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 結帳方式說明 */}
      <section className="bg-white rounded-2xl p-8 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">付款方式</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <span className="text-3xl">🏦</span>
            <div>
              <h3 className="font-semibold text-gray-800">銀行轉帳</h3>
              <p className="text-sm text-gray-500 mt-1">
                下單後 24 小時內完成匯款，匯款後請回報帳號後 5 碼
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-3xl">📦</span>
            <div>
              <h3 className="font-semibold text-gray-800">賣貨便取貨付款</h3>
              <p className="text-sm text-gray-500 mt-1">
                超商取貨，到貨後現場付款更安心
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
