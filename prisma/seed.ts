/**
 * Prisma seed script
 * 用途：在 dev/staging 環境建立初始分類、商品與 slug 資料
 * 執行：npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL 未設定')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ALA-35 指定分類 slug 對照
const CATEGORIES = [
  { name: '美妝保養', slug: 'korean-beauty' },
  { name: '食品零食', slug: 'korean-food' },
  { name: '服飾配件', slug: 'korean-fashion' },
  { name: '偶像周邊', slug: 'kpop-goods' },
  { name: '生活用品', slug: 'korean-lifestyle' },
]

// 範例商品（依分類 slug 對應）
const PRODUCTS: {
  name: string
  slug: string
  description: string
  price: number
  categorySlug: string
  sku: string
  quantity: number
}[] = [
  // 美妝保養
  {
    name: 'COSRX Snail 96 Mucin Essence 100ml',
    slug: 'cosrx-snail-96-mucin-essence-100ml',
    description: '蝸牛分泌濾液 96%，深層保濕修護。',
    price: 650,
    categorySlug: 'korean-beauty',
    sku: 'COSRX-SNAIL-96-100',
    quantity: 50,
  },
  {
    name: 'Laneige Water Sleeping Mask 70ml',
    slug: 'laneige-water-sleeping-mask-70ml',
    description: '蘭芝水酷保濕睡眠面膜，夜間補水。',
    price: 880,
    categorySlug: 'korean-beauty',
    sku: 'LANEIGE-WSM-70',
    quantity: 30,
  },
  {
    name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner 150ml',
    slug: 'some-by-mi-aha-bha-pha-toner-150ml',
    description: '三酸煥膚調理水，改善粗糙膚質。',
    price: 560,
    categorySlug: 'korean-beauty',
    sku: 'SOMEBYMI-TONER-150',
    quantity: 45,
  },
  // 食品零食
  {
    name: 'Samyang 2x Spicy Buldak Ramen 5-pack',
    slug: 'samyang-2x-spicy-buldak-ramen-5pack',
    description: '三養超辣火雞拉麵 5 包組，挑戰極限辣度。',
    price: 320,
    categorySlug: 'korean-food',
    sku: 'SAMYANG-2X-5PK',
    quantity: 100,
  },
  {
    name: 'Orion Choco Pie 12-pack',
    slug: 'orion-choco-pie-12pack',
    description: '好麗友巧克力派 12 入，韓國經典零食。',
    price: 280,
    categorySlug: 'korean-food',
    sku: 'ORION-CP-12',
    quantity: 80,
  },
  // 服飾配件
  {
    name: 'Kakao Friends Ryan Tote Bag',
    slug: 'kakao-friends-ryan-tote-bag',
    description: 'Kakao Friends 萊恩帆布托特包，可愛又實用。',
    price: 750,
    categorySlug: 'korean-fashion',
    sku: 'KAKAO-RYAN-TOTE',
    quantity: 20,
  },
  // 偶像周邊
  {
    name: 'BTS Official Lightstick Army Bomb Ver.4',
    slug: 'bts-official-lightstick-army-bomb-ver4',
    description: 'BTS 官方應援棒 Army Bomb 第四版。',
    price: 1200,
    categorySlug: 'kpop-goods',
    sku: 'BTS-LIGHTSTICK-V4',
    quantity: 15,
  },
  {
    name: 'NewJeans Official Photo Book 2nd Album',
    slug: 'newjeans-official-photo-book-2nd-album',
    description: 'NewJeans 第二張正規專輯官方寫真書。',
    price: 850,
    categorySlug: 'kpop-goods',
    sku: 'NJ-PHOTOBOOK-2ND',
    quantity: 25,
  },
  // 生活用品
  {
    name: 'Innisfree Green Tea Seed Cream 50ml',
    slug: 'innisfree-green-tea-seed-cream-50ml',
    description: '悅詩風吟綠茶籽保濕霜，清爽不油膩。',
    price: 720,
    categorySlug: 'korean-lifestyle',
    sku: 'INNISFREE-GTS-50',
    quantity: 35,
  },
]

async function main() {
  console.log('🌱 開始 seed...')

  // Upsert 分類（依 slug 去重）
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    console.log(`  ✓ 分類: ${cat.name} (${cat.slug})`)
  }

  // Upsert 商品（依 slug 去重）
  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } })
    if (!category) {
      console.warn(`  ⚠ 找不到分類 ${p.categorySlug}，跳過 ${p.name}`)
      continue
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, price: p.price, categoryId: category.id },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        status: 'active',
        categoryId: category.id,
        inventory: {
          create: { sku: p.sku, quantity: p.quantity },
        },
      },
    })
    console.log(`  ✓ 商品: ${p.name} (${p.slug})`)
  }

  console.log('✅ Seed 完成')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
