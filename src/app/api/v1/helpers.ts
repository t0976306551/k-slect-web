// 商品回應轉換輔助（後台 images 為 jsonb nullable，轉換為統一格式）
export function toProductResponse(product: { images?: string[] | null; [key: string]: unknown }): typeof product & { image: string | null } {
  return {
    ...product,
    image: product.images?.[0] ?? null,
  }
}

export function toProductListResponse(products: Array<{ images?: string[] | null; [key: string]: unknown }>): Array<typeof products[0] & { image: string | null }> {
  return products.map(toProductResponse)
}
