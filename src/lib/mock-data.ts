export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  description?: string;
  tag?: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: "1",
    name: "COSRX 蝸牛精華液 96%",
    slug: "cosrx-snail-96",
    price: 420,
    originalPrice: 560,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    category: "beauty",
    rating: 4.8,
    reviewCount: 1203,
    soldCount: 3847,
    description: "COSRX Advanced Snail 96 Mucin Power Essence 蝸牛精華液，深度保濕修護，適合所有膚質。",
  },
  {
    id: "2",
    name: "三養辣麵 5 入組",
    slug: "samyang-hot-noodles-5pack",
    price: 189,
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
    category: "food",
    rating: 4.9,
    reviewCount: 2341,
    soldCount: 9823,
    description: "韓國原裝進口三養火辣雞麵，辣中帶勁，挑戰你的味蕾！",
  },
  {
    id: "3",
    name: "韓版帆布托特包",
    slug: "korean-canvas-tote",
    price: 680,
    originalPrice: 850,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    category: "fashion",
    rating: 4.6,
    reviewCount: 456,
    soldCount: 1200,
    description: "簡約韓版帆布托特包，大容量設計，適合日常通勤與購物使用。",
  },
  {
    id: "4",
    name: "Mediheal 玻尿酸面膜 10 入",
    slug: "mediheal-mask-10pack",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=80",
    category: "beauty",
    rating: 4.7,
    reviewCount: 892,
    soldCount: 5421,
    description: "Mediheal 玻尿酸保濕面膜，瞬間補水鎖水，讓肌膚水潤飽滿。",
    tag: "買3折扣",
  },
  {
    id: "5",
    name: "LANEIGE 水光精華露",
    slug: "laneige-water-essence",
    price: 650,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
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
    category: "fashion",
    rating: 4.4,
    reviewCount: 234,
    soldCount: 876,
  },
];

export const mockCategories = [
  { id: "beauty", name: "美妝保養", icon: "sparkles", color: "#7C9070" },
  { id: "food", name: "食品零食", icon: "cookie", color: "#D4845E" },
  { id: "fashion", name: "服飾配件", icon: "shirt", color: "#5B9BD5" },
  { id: "hot", name: "熱銷推薦", icon: "flame", color: "#E25555" },
  { id: "new", name: "新品上架", icon: "package", color: "#2D2D2D" },
];
