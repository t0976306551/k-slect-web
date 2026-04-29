"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import LineIcon from "@/components/LineIcon";
import type { BankTransferReport } from "@/types";
import type { OrderDetail } from "./_components/types";
import DetailSkeleton from "./_components/DetailSkeleton";
import ProgressTracker from "./_components/ProgressTracker";
import OrderItemList from "./_components/OrderItemList";
import OrderSummaryCard from "./_components/OrderSummaryCard";
import BankTransferCard from "./_components/BankTransferCard";
import RecipientCard from "./_components/RecipientCard";

function ErrorView({ message }: { readonly message: string }) {
  return (
    <div className="max-w-[640px] mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <p className="font-jakarta font-medium text-[15px] text-[#2D2D2D]">
        {message}
      </p>
      <Link href="/orders" className="text-[14px] text-[#7C9070] hover:underline">
        返回訂單列表
      </Link>
    </div>
  );
}

function MobileHeader({ onBack }: { readonly onBack: () => void }) {
  return (
    <div className="md:hidden bg-white border-b border-[#F0EFEC] flex items-center px-4 h-[54px]">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 -ml-1"
        aria-label="返回"
      >
        <ArrowLeft size={20} className="text-[#2D2D2D]" />
      </button>
      <span className="flex-1 text-center text-[15px] font-medium text-[#2D2D2D] -ml-9">
        訂單詳情
      </span>
    </div>
  );
}

function useOrderDetail(id: string | undefined) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const email = typeof window !== 'undefined' ? localStorage.getItem('customer_email') ?? '' : ''
        const qs = email ? `?email=${encodeURIComponent(email)}` : ''
        const res = await fetch(`/api/v1/orders/${id}${qs}`);
        const json = await res.json();
        if (json.error) setError(json.error.message);
        else setOrder(json.data);
      } catch {
        setError("載入失敗，請稍後再試");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return { order, loading, error };
}

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const { order, loading, error } = useOrderDetail(id);

  if (loading) return <DetailSkeleton />;
  if (error || !order) return <ErrorView message={error ?? "找不到此訂單"} />;

  const isCancelled = order.status === "cancelled";
  const isBankTransfer = order.paymentMethod === "bank_transfer";

  const bankReport: BankTransferReport | null = order.bankTransferReport
    ? { orderId: order.id, ...order.bankTransferReport }
    : null;

  return (
    <>
      <MobileHeader onBack={() => router.back()} />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-5 md:py-10">
        {/* 桌面版麵包屑 */}
        <div className="hidden md:flex items-center gap-1.5 text-[12px] text-[#9E9E9E] mb-6">
          <Link href="/orders" className="hover:text-[#7C9070] transition-colors">
            我的訂單
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#2D2D2D]">訂單詳情</span>
        </div>

        {/* 頁面標題 */}
        <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8">
          <h1 className="font-fraunces font-medium text-[22px] md:text-[28px] text-[#2D2D2D] leading-tight">
            訂單{" "}
            <span className="font-mono text-[16px] md:text-[20px] text-[#9E9E9E] font-normal">
              #{order.id.slice(0, 14)}
            </span>
          </h1>
          <StatusBadge status={order.status} />
        </div>

        {/* 兩欄佈局 */}
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8 md:items-start">
          {/* 主欄 */}
          <div className="space-y-4">
            {isCancelled && (
              <div className="flex gap-3 bg-[#FBE9E7] border border-[#F9D6CE] rounded-[14px] p-4">
                <AlertCircle size={15} className="text-[#D4845E] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#D4845E]">此訂單已取消</p>
              </div>
            )}

            {!isCancelled && (
              <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
                <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D] mb-5">
                  物流進度
                </h2>
                <ProgressTracker status={order.status} />
              </div>
            )}

            <OrderItemList items={order.items} totalAmount={order.totalAmount} />

            {order.note && (
              <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
                <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D] mb-2">
                  訂單備註
                </h2>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{order.note}</p>
              </div>
            )}
          </div>

          {/* 側欄 */}
          <div className="mt-4 md:mt-0 md:sticky md:top-[80px] space-y-4">
            <OrderSummaryCard
              createdAt={order.createdAt}
              paymentMethod={order.paymentMethod}
              paymentStatus={order.paymentStatus}
              totalAmount={order.totalAmount}
              shippingMethod={order.shippingMethod}
              shippingProvider={order.shippingProvider}
              trackingNo={order.trackingNo}
            />

            {isBankTransfer && (
              <BankTransferCard
                orderId={order.id}
                totalAmount={order.totalAmount}
                paymentStatus={order.paymentStatus}
                snapshot={order.bankTransferInfoSnapshot}
                bankReport={bankReport}
              />
            )}

            <RecipientCard
              customer={order.customer}
              shippingMethod={order.shippingMethod}
              shippingAddress={order.shippingAddress}
              pickupStore={order.pickupStore}
            />

            <a
              href="https://line.me/R/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05b04c] text-white font-jakarta font-medium text-[14px] py-3.5 rounded-[12px] transition-colors w-full"
            >
              <LineIcon size={17} />
              聯絡客服
            </a>

            {order.status === "completed" && (
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#E8E8E8] hover:border-[#D4845E] text-[#D4845E] font-jakarta font-medium text-[14px] py-3.5 rounded-[12px] transition-colors">
                <RotateCcw size={14} />
                申請退款
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
