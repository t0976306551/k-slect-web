'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Cookie,
  Shirt,
  Flame,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { fetchCategories } from '@/lib/api'
import type { MockCategory } from '@/lib/api'

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  cookie: Cookie,
  shirt: Shirt,
  flame: Flame,
  package: Package,
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<MockCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res.data) setCategories(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-[#7C9070] font-jakarta text-sm">載入中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="font-fraunces text-[24px] md:text-[32px] font-medium text-[#2D2D2D]">
          商品分類
        </h1>
        <p className="font-jakarta text-[13px] md:text-[14px] text-[#6B6B6B] mt-1">
          選擇你感興趣的分類，探索韓國直送好物
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon ?? ''] ?? Package
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-7 flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className="w-11 h-11 md:w-14 md:h-14 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <Icon size={24} style={{ color: cat.color }} strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-jakarta text-[14px] md:text-[16px] font-semibold text-[#2D2D2D]">
                  {cat.name}
                </span>
                <span className="font-jakarta text-[12px] md:text-[13px] text-[#6B6B6B]">
                  {cat.productCount} 件商品
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
