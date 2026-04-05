import type { Product } from '@/types'

export function toProductResponse(product: any): Product & { image: string | null } {
  return {
    ...product,
    image: product.images?.[0] ?? null,
  }
}

export function toProductListResponse(products: any[]): Array<Product & { image: string | null }> {
  return products.map(toProductResponse)
}
