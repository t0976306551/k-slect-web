/**
 * Prisma seed script
 * 用途：在 dev/staging 環境建立初始分類、商品、與 demo 訂單資料
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

  // ── Demo 客戶與訂單 ────────────────────────────────────────────
  const DEMO_EMAIL = 'demo@kslect.com'

  // Upsert demo 客戶
  const demoCustomer = await prisma.customer.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: '林小美', phone: '0912-345-678', address: '台北市大安區忠孝東路四段100號' },
    create: {
      name: '林小美',
      email: DEMO_EMAIL,
      phone: '0912-345-678',
      address: '台北市大安區忠孝東路四段100號',
    },
  })
  console.log(`  ✓ 客戶: ${demoCustomer.name} (${demoCustomer.email})`)

  // 撈需要的商品
  const slugsNeeded = [
    'cosrx-snail-96-mucin-essence-100ml',
    'laneige-water-sleeping-mask-70ml',
    'newjeans-official-photo-book-2nd-album',
    'innisfree-green-tea-seed-cream-50ml',
    'some-by-mi-aha-bha-pha-toner-150ml',
  ]
  const products = await prisma.product.findMany({
    where: { slug: { in: slugsNeeded } },
  })
  const bySlug = Object.fromEntries(products.map((p) => [p.slug!, p]))

  // Demo 訂單定義（4 種不同狀態）
  type DemoOrderDef = {
    status: string
    paymentMethod: string
    note?: string
    createdAt: Date
    items: { slug: string; quantity: number }[]
  }

  const DEMO_ORDERS: DemoOrderDef[] = [
    {
      status: 'completed',
      paymentMethod: 'bank_transfer',
      note: '請多包一層保護，謝謝',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
      items: [
        { slug: 'cosrx-snail-96-mucin-essence-100ml', quantity: 2 },
        { slug: 'laneige-water-sleeping-mask-70ml', quantity: 1 },
      ],
    },
    {
      status: 'shipped',
      paymentMethod: 'bank_transfer',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
      items: [
        { slug: 'newjeans-official-photo-book-2nd-album', quantity: 1 },
        { slug: 'some-by-mi-aha-bha-pha-toner-150ml', quantity: 1 },
      ],
    },
    {
      status: 'confirmed',
      paymentMethod: 'bank_transfer',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
      items: [{ slug: 'innisfree-green-tea-seed-cream-50ml', quantity: 3 }],
    },
    {
      status: 'pending',
      paymentMethod: 'seller_ship',
      note: '盡快出貨',
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1小時前
      items: [
        { slug: 'cosrx-snail-96-mucin-essence-100ml', quantity: 1 },
        { slug: 'laneige-water-sleeping-mask-70ml', quantity: 2 },
        { slug: 'innisfree-green-tea-seed-cream-50ml', quantity: 1 },
      ],
    },
  ]

  for (const def of DEMO_ORDERS) {
    const validItems = def.items.filter((i) => bySlug[i.slug])
    if (validItems.length === 0) continue

    const totalAmount = validItems.reduce(
      (sum, i) => sum + bySlug[i.slug].price * i.quantity,
      0,
    )

    // 用 email 作為唯一鍵：若已有相同 status+paymentMethod 的 demo 訂單就跳過
    const existing = await prisma.order.findFirst({
      where: {
        customerId: demoCustomer.id,
        status: def.status,
        paymentMethod: def.paymentMethod,
        createdAt: { gte: new Date(def.createdAt.getTime() - 60_000) },
      },
    })
    if (existing) {
      console.log(`  ↩ 跳過既有 demo 訂單 (${def.status})`)
      continue
    }

    const order = await prisma.order.create({
      data: {
        customerId: demoCustomer.id,
        status: def.status,
        paymentMethod: def.paymentMethod,
        totalAmount,
        note: def.note,
        createdAt: def.createdAt,
        items: {
          create: validItems.map((i) => ({
            productId: bySlug[i.slug].id,
            quantity: i.quantity,
            priceAtOrder: bySlug[i.slug].price,
          })),
        },
      },
    })
    console.log(`  ✓ 訂單: ${order.id.slice(0, 12)}… [${def.status}] NT$${totalAmount}`)
  }

  console.log('')
  console.log('💡 Demo 帳號 Email:', DEMO_EMAIL)
  console.log('✅ Seed 完成')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
