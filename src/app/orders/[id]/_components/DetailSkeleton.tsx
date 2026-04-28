export default function DetailSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-10 animate-pulse">
      <div className="h-2.5 w-40 bg-[#F0EFEC] rounded mb-7" />
      <div className="h-7 w-52 bg-[#F0EFEC] rounded mb-8" />
      <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-6 h-28" />
          <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-6 h-52" />
        </div>
        <div className="mt-4 md:mt-0 space-y-4">
          <div className="bg-white rounded-[16px] border border-[#F0EFEC] h-36" />
          <div className="bg-white rounded-[16px] border border-[#F0EFEC] h-28" />
        </div>
      </div>
    </div>
  );
}
