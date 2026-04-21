import type { ProductOption, ProductVariant } from '@/types'

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  descriptionImages?: string[];
  category: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  description?: string;
  tag?: string;
  options?: ProductOption[]
  variants?: ProductVariant[]
}

export const mockProducts: MockProduct[] = [
  {
    id: "1",
    name: "COSRX 蝸牛精華液 96%",
    slug: "cosrx-snail-96",
    price: 420,
    originalPrice: 560,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.8,
    reviewCount: 1203,
    soldCount: 3847,
    description: "COSRX Advanced Snail 96 Mucin Power Essence 蝸牛精華液，含有 96.3% 蝸牛分泌物過濾物，是全線最高濃度的蝸牛精華。\n\n✦ 主要成分\n蝸牛分泌物過濾物 96.3%、特殊保濕因子、天然保濕成分\n\n✦ 功效\n・深度保濕修護，鎖水保濕\n・改善膚色不均，提亮膚色\n・細紋修護，提升肌膚彈性\n・舒緩泛紅，鎮定敏感肌膚\n\n✦ 使用方式\n潔膚後，取適量於掌心，輕輕拍打至完全吸收。早晚各使用一次效果最佳。可用於化妝水後、乳液前步驟。\n\n✦ 適用膚質\n所有膚質均適用，尤其推薦給需要深層保濕及修護的肌膚。\n\n✦ 產品資訊\n容量：96ml｜建議效期：3 年｜原產地：韓國",
    descriptionImages: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=85",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=85",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=85",
    ],
    options: [
      {
        id: "opt1-spec",
        productId: "1",
        name: "規格",
        position: 0,
        values: [
          { id: "v1-30ml", optionId: "opt1-spec", value: "30ml", position: 0 },
          { id: "v1-96ml", optionId: "opt1-spec", value: "96ml", position: 1 },
        ],
      },
    ],
    variants: [
      {
        id: "var1-30ml",
        productId: "1",
        sku: "cosrx-snail-30ml",
        price: 280,
        image: null,
        quantity: 50,
        lowStockThreshold: 5,
        status: "active",
        optionValues: [
          { id: "v1-30ml", optionId: "opt1-spec", value: "30ml", position: 0 },
        ],
      },
      {
        id: "var1-96ml",
        productId: "1",
        sku: "cosrx-snail-96ml",
        price: null,
        image: null,
        quantity: 99,
        lowStockThreshold: 5,
        status: "active",
        optionValues: [
          { id: "v1-96ml", optionId: "opt1-spec", value: "96ml", position: 1 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "三養辣麵 5 入組",
    slug: "samyang-hot-noodles-5pack",
    price: 189,
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80",
      "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80",
    ],
    category: "food",
    rating: 4.9,
    reviewCount: 2341,
    soldCount: 9823,
    description: "韓國原裝進口三養火辣雞麵，辣中帶勁，挑戰你的味蕾！\n\n✦ 產品特色\n・辣度指數：★★★★★（極辣）\n・來自韓國三養食品，品質保證\n・一包有 140g，份量十足\n\n✦ 建議吃法\n1. 鍋中加入 600ml 水，煮沸後放入麵條煮 5 分鐘\n2. 倒掉大部分湯水，僅留約 8 匙湯底\n3. 加入附贈醬料包與芝麻包，攪拌均勻即可享用\n\n✦ 注意事項\n孕婦、兒童、腸胃不適者請酌量食用。\n\n✦ 產品資訊\n規格：140g × 5 入｜保存期限：12 個月｜原產地：韓國",
  },
  {
    id: "3",
    name: "韓版帆布托特包",
    slug: "korean-canvas-tote",
    price: 680,
    originalPrice: 850,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
    category: "fashion",
    rating: 4.6,
    reviewCount: 456,
    soldCount: 1200,
    description: "簡約韓版帆布托特包，大容量設計，適合日常通勤與購物使用。\n\n✦ 產品特色\n・優質帆布材質，耐用防潑水\n・附有拉鍊內層口袋，方便收納\n・加寬肩帶設計，長時間背負舒適\n・多種顏色選擇，百搭日常穿搭\n\n✦ 尺寸資訊\nS（小）：寬 35cm × 高 38cm × 深 12cm\nL（大）：寬 42cm × 高 45cm × 深 15cm\n\n✦ 產品資訊\n材質：100% 棉帆布｜五金：古銅色｜原產地：韓國",
    descriptionImages: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=85",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85",
    ],
    options: [
      {
        id: "opt3-color",
        productId: "3",
        name: "顏色",
        position: 0,
        values: [
          { id: "v3c-black", optionId: "opt3-color", value: "黑色", position: 0 },
          { id: "v3c-beige", optionId: "opt3-color", value: "米色", position: 1 },
          { id: "v3c-blue",  optionId: "opt3-color", value: "藍色", position: 2 },
        ],
      },
      {
        id: "opt3-size",
        productId: "3",
        name: "尺寸",
        position: 1,
        values: [
          { id: "v3s-s", optionId: "opt3-size", value: "S", position: 0 },
          { id: "v3s-l", optionId: "opt3-size", value: "L", position: 1 },
        ],
      },
    ],
    variants: [
      {
        id: "var3-bs", productId: "3", sku: "tote-black-s", price: null,  image: null, quantity: 20, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-black", optionId: "opt3-color", value: "黑色", position: 0 },
          { id: "v3s-s",     optionId: "opt3-size",  value: "S",   position: 0 },
        ],
      },
      {
        id: "var3-bl", productId: "3", sku: "tote-black-l", price: 750,  image: null, quantity: 15, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-black", optionId: "opt3-color", value: "黑色", position: 0 },
          { id: "v3s-l",     optionId: "opt3-size",  value: "L",   position: 1 },
        ],
      },
      {
        id: "var3-es", productId: "3", sku: "tote-beige-s", price: null,  image: null, quantity: 0,  lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-beige", optionId: "opt3-color", value: "米色", position: 1 },
          { id: "v3s-s",     optionId: "opt3-size",  value: "S",   position: 0 },
        ],
      },
      {
        id: "var3-el", productId: "3", sku: "tote-beige-l", price: 750,  image: null, quantity: 10, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-beige", optionId: "opt3-color", value: "米色", position: 1 },
          { id: "v3s-l",     optionId: "opt3-size",  value: "L",   position: 1 },
        ],
      },
      {
        id: "var3-us", productId: "3", sku: "tote-blue-s",  price: null,  image: null, quantity: 12, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-blue",  optionId: "opt3-color", value: "藍色", position: 2 },
          { id: "v3s-s",     optionId: "opt3-size",  value: "S",   position: 0 },
        ],
      },
      {
        id: "var3-ul", productId: "3", sku: "tote-blue-l",  price: 750,  image: null, quantity: 8,  lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v3c-blue",  optionId: "opt3-color", value: "藍色", position: 2 },
          { id: "v3s-l",     optionId: "opt3-size",  value: "L",   position: 1 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Mediheal 玻尿酸面膜 10 入",
    slug: "mediheal-mask-10pack",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.7,
    reviewCount: 892,
    soldCount: 5421,
    description: "Mediheal 玻尿酸保濕面膜，瞬間補水鎖水，讓肌膚水潤飽滿。\n\n✦ 主要成分\n透明質酸（玻尿酸）、天然保濕因子 NMF、尿囊素\n\n✦ 功效\n・超強補水，持久鎖水保濕\n・修護肌膚屏障，改善粗糙\n・舒緩乾燥緊繃感，肌膚水潤有光澤\n\n✦ 使用方式\n潔膚後取出面膜，敷臉 20-30 分鐘後取下，輕拍精華至吸收。每週建議使用 2-3 次。\n\n✦ 產品資訊\n規格：1 盒 10 片｜適用膚質：所有膚質｜原產地：韓國",
    tag: "買3折扣",
  },
  {
    id: "5",
    name: "LANEIGE 水光精華露",
    slug: "laneige-water-essence",
    price: 650,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1573461160327-1c67c3e2d40e?w=800&q=80",
      "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.8,
    reviewCount: 678,
    soldCount: 2156,
  },
  {
    id: "6",
    name: "Etude House 防曬乳 SPF50+",
    slug: "etude-sunscreen-spf50",
    price: 320,
    originalPrice: 420,
    image: "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.5,
    reviewCount: 345,
    soldCount: 1678,
  },
  {
    id: "7",
    name: "韓國海苔禮盒 24 包裝",
    slug: "korean-seaweed-gift-box",
    price: 450,
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
      "https://images.unsplash.com/photo-1607301406259-dfb186e15de3?w=800&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80",
    ],
    category: "food",
    rating: 4.7,
    reviewCount: 521,
    soldCount: 3210,
  },
  {
    id: "8",
    name: "韓系休閒棒球帽",
    slug: "korean-baseball-cap",
    price: 380,
    originalPrice: 480,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80",
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80",
    ],
    category: "fashion",
    rating: 4.4,
    reviewCount: 234,
    soldCount: 876,
    options: [
      {
        id: "opt8-color",
        productId: "8",
        name: "顏色",
        position: 0,
        values: [
          { id: "v8c-black", optionId: "opt8-color", value: "黑色",  position: 0 },
          { id: "v8c-white", optionId: "opt8-color", value: "白色",  position: 1 },
          { id: "v8c-denim", optionId: "opt8-color", value: "牛仔藍", position: 2 },
        ],
      },
    ],
    variants: [
      {
        id: "var8-black", productId: "8", sku: "cap-black", price: null, image: null, quantity: 25, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v8c-black", optionId: "opt8-color", value: "黑色",  position: 0 },
        ],
      },
      {
        id: "var8-white", productId: "8", sku: "cap-white", price: null, image: null, quantity: 0,  lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v8c-white", optionId: "opt8-color", value: "白色",  position: 1 },
        ],
      },
      {
        id: "var8-denim", productId: "8", sku: "cap-denim", price: null, image: null, quantity: 18, lowStockThreshold: 5, status: "active",
        optionValues: [
          { id: "v8c-denim", optionId: "opt8-color", value: "牛仔藍", position: 2 },
        ],
      },
    ],
  },
  {
    id: "9",
    name: "韓國柚子蜂蜜茶 500g",
    slug: "korean-yuja-honey-tea",
    price: 280,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
    ],
    category: "food",
    rating: 4.6,
    reviewCount: 418,
    soldCount: 2100,
    description: "韓國傳統柚子蜂蜜茶，酸甜回甘，富含維他命 C，冷熱皆宜。\n\n✦ 飲用方式\n取 1–2 匙果醬加入 150ml 熱水或冰水中攪拌即可。\n\n✦ 產品資訊\n容量：500g｜原產地：韓國",
  },
  {
    id: "10",
    name: "INNISFREE 綠茶精華液",
    slug: "innisfree-green-tea-essence",
    price: 580,
    originalPrice: 720,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
      "https://images.unsplash.com/photo-1573461160327-1c67c3e2d40e?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.7,
    reviewCount: 534,
    soldCount: 1890,
    tag: "熱銷",
    description: "INNISFREE 濟州綠茶精華液，富含抗氧化成分，改善膚色暗沉，提升肌膚光澤感。\n\n✦ 產品資訊\n容量：80ml｜原產地：韓國",
  },
  {
    id: "11",
    name: "韓系寬版連帽T恤",
    slug: "korean-oversized-hoodie",
    price: 760,
    originalPrice: 980,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    ],
    category: "fashion",
    rating: 4.5,
    reviewCount: 189,
    soldCount: 654,
    description: "韓系寬版連帽衛衣，採用高磅數棉質，觸感柔軟舒適，素色設計百搭各式穿搭。\n\n✦ 產品資訊\n材質：100% 棉｜版型：寬鬆版型｜原產地：韓國",
  },
  {
    id: "12",
    name: "Peripera 水光唇釉",
    slug: "peripera-ink-mood-glowy-tint",
    price: 240,
    image: "https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    ],
    category: "beauty",
    rating: 4.9,
    reviewCount: 1022,
    soldCount: 4530,
    tag: "超熱賣",
    description: "Peripera 水光唇釉，質地輕薄水潤，顯色飽和，提升嘴唇水嫩感，久戴不乾燥。\n\n✦ 產品資訊\n容量：4g｜原產地：韓國",
  },
];

export const mockCategories = [
  { id: "clbeauty0001", slug: "beauty",  name: "美妝保養", icon: "sparkles", color: "#7C9070" },
  { id: "clfood000002", slug: "food",    name: "食品零食", icon: "cookie",   color: "#D4845E" },
  { id: "clfashion003", slug: "fashion", name: "服飾配件", icon: "shirt",    color: "#5B9BD5" },
  { id: "clhot0000004", slug: "hot",     name: "熱銷推薦", icon: "flame",    color: "#E25555" },
  { id: "clnew0000005", slug: "new",     name: "新品上架", icon: "package",  color: "#2D2D2D" },
];
