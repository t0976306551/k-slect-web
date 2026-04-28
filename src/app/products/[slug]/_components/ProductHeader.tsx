interface ProductHeaderProps {
  readonly categoryName?: string
  readonly productName: string
}

export default function ProductHeader({
  categoryName,
  productName,
}: ProductHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {categoryName && (
        <span className="font-jakarta text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C9070]">
          {categoryName}
        </span>
      )}
      <h1 className="font-fraunces text-[22px] md:text-[28px] font-medium text-[#2D2D2D] leading-[1.25] tracking-tight">
        {productName}
      </h1>
    </div>
  )
}
