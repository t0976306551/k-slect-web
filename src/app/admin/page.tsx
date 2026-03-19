import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">後台首頁</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <Link
          href="/admin/products"
          className="bg-white border border-purple-100 rounded-2xl p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">📦</div>
          <div className="font-semibold text-gray-800">商品管理</div>
          <div className="text-sm text-gray-500 mt-1">管理商品與推廣</div>
        </Link>
        <Link
          href="/admin/promotions"
          className="bg-white border border-purple-100 rounded-2xl p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">📣</div>
          <div className="font-semibold text-gray-800">推廣紀錄</div>
          <div className="text-sm text-gray-500 mt-1">查看 LINE/FB 推廣歷史</div>
        </Link>
      </div>
    </div>
  )
}
