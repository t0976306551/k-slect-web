import Link from "next/link";
import { Check } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ orderId?: string; total?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { orderId, total: totalParam } = await searchParams;
  const displayOrderId = orderId ?? "ORD-XXXXXXX";
  const total = parseInt(totalParam ?? "0");

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7F6F3]">
      {/* Content */}
      <div className="max-w-[480px] mx-auto px-5 md:px-12 py-8 md:py-16">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#D4845E] flex items-center justify-center shadow-lg">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] md:text-[30px] font-semibold text-[#2D2D2D] mb-2">
            訂單已成立！
          </h1>
          <p className="text-[14px] text-[#9E9E9E]">
            感謝您的購買，我們將盡快為您備貨
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9E9E9E]">訂單編號</span>
              <span className="text-[#2D2D2D] font-medium">{displayOrderId}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9E9E9E]">預計送達</span>
              <span className="text-[#2D2D2D] font-medium">3-5 個工作天</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9E9E9E]">付款金額</span>
              <span className="text-[#7C9070] font-bold">
                {total > 0 ? `NT$${total.toLocaleString()}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* LINE reminder (mobile only) */}
        <div className="md:hidden flex gap-2.5 bg-white border border-[#F0EFEC] rounded-[12px] p-4 mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#06C755] shrink-0 mt-0.5">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.254l2.464 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
            加入我們的 LINE 好友，隨時掌握訂單最新狀態及獨家優惠！
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="w-full flex items-center justify-center bg-[#7C9070] text-white text-[15px] font-semibold py-3.5 rounded-[10px] hover:bg-[#6B7F60] transition-colors"
          >
            查看訂單詳情
          </Link>
          <Link
            href="/products"
            className="w-full flex items-center justify-center border border-[#E8E8E8] bg-white text-[#6B6B6B] text-[15px] font-medium py-3.5 rounded-[10px] hover:border-[#D0D0D0] transition-colors"
          >
            繼續購物
          </Link>
        </div>
      </div>
    </div>
  );
}


