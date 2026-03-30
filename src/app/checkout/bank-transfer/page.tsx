import Link from "next/link";
import { Check, Copy } from "lucide-react";
import Navbar from "@/components/Navbar";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function BankTransferPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const displayOrderId = orderId ?? "ORD-XXXXXXX";
  const accountNumber = "012-3456-7890123";

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <Navbar />

      <div className="max-w-[640px] mx-auto px-5 md:px-12 py-10">
        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8 bg-white rounded-[12px] border border-[#F0EFEC] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7C9070] flex items-center justify-center">
              <Check size={12} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-medium text-[#7C9070]">訂單已成立</span>
          </div>
          <div className="flex-1 h-[1px] bg-[#F0EFEC]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-[#7C9070] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7C9070]" />
            </div>
            <span className="text-[13px] font-medium text-[#2D2D2D]">請在時限轉帳</span>
          </div>
        </div>

        {/* Order ID */}
        <p className="text-[13px] text-[#9E9E9E] text-center mb-6">
          訂單編號：{displayOrderId}
          <span className="ml-3 text-[#9E9E9E]">預計 3 工作天內出貨</span>
        </p>

        {/* Bank Info Card */}
        <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-6">
          <h2 className="text-[18px] font-semibold text-[#2D2D2D] mb-5">匯款帳戶資訊</h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-[12px] text-[#9E9E9E] mb-1">銀行名稱</p>
              <p className="text-[15px] font-semibold text-[#2D2D2D]">台灣銀行</p>
            </div>
            <div>
              <p className="text-[12px] text-[#9E9E9E] mb-1">帳號分行</p>
              <p className="text-[15px] font-semibold text-[#2D2D2D]">板橋分行</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[12px] text-[#9E9E9E] mb-1">帳號</p>
            <div className="flex items-center gap-3">
              <p className="text-[18px] font-bold text-[#2D2D2D] tracking-wide">{accountNumber}</p>
              <button className="flex items-center gap-1.5 text-[#7C9070] text-[12px] font-medium border border-[#7C9070] rounded-lg px-2.5 py-1 hover:bg-[#7C9070]/5 transition-colors">
                <Copy size={12} />
                複製
              </button>
            </div>
          </div>

          <div>
            <p className="text-[12px] text-[#9E9E9E] mb-1">戶名</p>
            <p className="text-[15px] font-semibold text-[#2D2D2D]">K-slect 國際貿易股份有限公司</p>
          </div>

          {/* Warning */}
          <div className="mt-5 flex gap-2.5 bg-[#FFF8F5] border border-[#D4845E]/30 rounded-[10px] p-3.5">
            <div className="w-4 h-4 rounded-full bg-[#D4845E] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
            <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
              請在下單後 24 小時內完成轉帳，逾時訂單將自動取消。轉帳後請保留轉帳收據。
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            href={`/checkout/success?orderId=${displayOrderId}`}
            className="flex-1 flex items-center justify-center bg-[#7C9070] text-white text-[15px] font-semibold py-3.5 rounded-[10px] hover:bg-[#6B7F60] transition-colors"
          >
            我已完成轉帳
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center border border-[#E8E8E8] bg-white text-[#6B6B6B] text-[15px] font-medium py-3.5 rounded-[10px] hover:border-[#D0D0D0] transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
