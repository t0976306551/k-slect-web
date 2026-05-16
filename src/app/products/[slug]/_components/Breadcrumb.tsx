import Link from 'next/link'

interface BreadcrumbProps {
  readonly productName: string
}

export default function Breadcrumb({
  productName,
}: BreadcrumbProps): React.ReactElement {
  return (
    <nav className="hidden md:flex items-center gap-1.5 text-[12px] text-[#AEAAA4] max-w-[1440px] mx-auto px-12 py-4">
      <Link href="/" className="hover:text-[#7C9070] transition-colors">首頁</Link>
      <span>/</span>
      <Link href="/#products" className="hover:text-[#7C9070] transition-colors">所有商品</Link>
      <span>/</span>
      <span className="text-[#2D2D2D] line-clamp-1">{productName}</span>
    </nav>
  )
}
