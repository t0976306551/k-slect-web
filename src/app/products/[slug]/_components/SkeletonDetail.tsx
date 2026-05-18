export default function SkeletonDetail(): React.ReactElement {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="md:hidden h-12 bg-white border-b border-[#F0EFEC]" />
      <div className="hidden md:block h-10 mx-12 mt-2">
        <div className="h-3 w-48 skeleton-shimmer rounded" />
      </div>
      <div className="md:px-12 md:pb-12 grid grid-cols-1 md:grid-cols-2 md:gap-12">
        <div className="w-full aspect-[4/3] md:aspect-square skeleton-shimmer md:rounded-[20px]" />
        <div className="px-4 md:px-0 py-5 md:py-0 flex flex-col gap-4">
          <div className="h-5 w-20 skeleton-shimmer rounded-full" />
          <div className="space-y-2">
            <div className="h-7 skeleton-shimmer rounded w-4/5" />
            <div className="h-7 skeleton-shimmer rounded w-3/5" />
          </div>
          <div className="h-9 skeleton-shimmer rounded w-1/3" />
          <div className="h-px skeleton-shimmer rounded" />
          <div className="space-y-2">
            <div className="h-3 skeleton-shimmer rounded w-1/4" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-16 skeleton-shimmer rounded-[8px]" />
              ))}
            </div>
          </div>
          <div className="h-12 skeleton-shimmer rounded-[12px] mt-2" />
        </div>
      </div>
    </div>
  )
}
