"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  RotateCcw,
  MapPin,
  Phone,
  User,
  Landmark,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  product: { id: string; name: string; slug?: string | null };
}

interface OrderDetail {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address?: string | null;
  };
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  pending_ship: "待出貨",
  shipped: "出貨中",
  completed: "已完成",
  cancelled: "已取消",
  refund_pending: "退款申請中",
  refunded: "已退款",
};

const STATUS_BG: Record<string, string> = {
  pending_ship: "#FFF3E0",
  shipped: "#E8F0E5",
  completed: "#F0F0F0",
  cancelled: "#FBE9E7",
  refund_pending: "#FFF8E1",
  refunded: "#F3E5F5",
};

const STATUS_COLOR: Record<string, string> = {
  pending_ship: "#E08020",
  shipped: "#5C7A52",
  completed: "#6B6B6B",
  cancelled: "#D4845E",
  refund_pending: "#D4A020",
  refunded: "#7B6FA2",
};

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "銀行轉帳",
  seller_ship: "貨到付款",
};

const PROGRESS_STEPS = [
  { key: "placed", label: "下單" },
  { key: "confirmed", label: "付款" },
  { key: "shipped", label: "出貨" },
  { key: "received", label: "收貨" },
];

const STATUS_PROGRESS: Record<string, number> = {
  pending_ship: 1,
  shipped: 2,
  completed: 3,
  cancelled: -1,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
      style={{
        background: STATUS_BG[status] ?? "#F0F0F0",
        color: STATUS_COLOR[status] ?? "#6B6B6B",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: STATUS_COLOR[status] ?? "#6B6B6B" }}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ProgressTracker({ status }: { status: string }) {
  const progressIdx = STATUS_PROGRESS[status] ?? 0;

  return (
    <div className="flex items-start">
      {PROGRESS_STEPS.map((step, idx) => {
        const done = idx <= progressIdx;
        const active = idx === progressIdx;
        const isFirst = idx === 0;
        const isLast = idx === PROGRESS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div
                className="flex-1 h-[2px]"
                style={{
                  background: isFirst ? "transparent" : done ? "#7C9070" : "#E8E8E8",
                }}
              />
              <div className="relative flex items-center justify-center shrink-0">
                {active && (
                  <span className="absolute w-7 h-7 rounded-full bg-[#7C9070]/20 animate-ping" />
                )}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: done ? "#7C9070" : "#E8E8E8" }}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5.2 L4 7 L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className="flex-1 h-[2px]"
                style={{
                  background: isLast
                    ? "transparent"
                    : idx < progressIdx
                    ? "#7C9070"
                    : "#E8E8E8",
                }}
              />
            </div>
            <span
              className="text-[11px] mt-2 font-medium"
              style={{ color: done ? "#7C9070" : "#BBBBBB" }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DetailSkeleton() {
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

const LINE_SVG = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.254l2.464 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error.message);
        else setOrder(json.data);
      })
      .catch(() => setError("載入失敗，請稍後再試"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !order) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="font-jakarta font-medium text-[15px] text-[#2D2D2D]">
          {error ?? "找不到此訂單"}
        </p>
        <Link href="/orders" className="text-[14px] text-[#7C9070] hover:underline">
          返回訂單列表
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <>
      {/* Mobile back-button header */}
      <div className="md:hidden bg-white border-b border-[#F0EFEC] flex items-center px-4 h-[54px]">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 -ml-1"
          aria-label="返回"
        >
          <ArrowLeft size={20} className="text-[#2D2D2D]" />
        </button>
        <span className="flex-1 text-center text-[15px] font-medium text-[#2D2D2D] -ml-9">
          訂單詳情
        </span>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-5 md:py-10">
        {/* Desktop breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-[12px] text-[#9E9E9E] mb-6">
          <Link href="/orders" className="hover:text-[#7C9070] transition-colors">
            我的訂單
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#2D2D2D]">訂單詳情</span>
        </div>

        {/* Page heading */}
        <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8">
          <h1 className="font-fraunces font-medium text-[22px] md:text-[28px] text-[#2D2D2D] leading-tight">
            訂單{" "}
            <span className="font-mono text-[16px] md:text-[20px] text-[#9E9E9E] font-normal">
              #{order.id.slice(0, 14)}
            </span>
          </h1>
          <StatusBadge status={order.status} />
        </div>

        {/* 2-column layout */}
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8 md:items-start">
          {/* Main column */}
          <div className="space-y-4">
            {/* Cancelled banner */}
            {isCancelled && (
              <div className="flex gap-3 bg-[#FBE9E7] border border-[#F9D6CE] rounded-[14px] p-4">
                <AlertCircle size={15} className="text-[#D4845E] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#D4845E]">此訂單已取消</p>
              </div>
            )}

            {/* Progress tracker */}
            {!isCancelled && (
              <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
                <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D] mb-5">
                  物流進度
                </h2>
                <ProgressTracker status={order.status} />
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F7F6F3] flex items-center justify-between">
                <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D]">
                  訂購商品
                </h2>
                <span className="text-[12px] text-[#9E9E9E]">共 {order.items.length} 件</span>
              </div>

              <div className="divide-y divide-[#F7F6F3]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-[10px] bg-[#F7F6F3] flex items-center justify-center shrink-0">
                      <Package size={20} className="text-[#C8C8C8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.product.slug ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-[13px] font-medium text-[#2D2D2D] hover:text-[#7C9070] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        <p className="text-[13px] font-medium text-[#2D2D2D] line-clamp-2 leading-snug">
                          {item.product.name}
                        </p>
                      )}
                      <p className="text-[12px] text-[#9E9E9E] mt-1 tabular-nums">
                        NT$ {item.priceAtOrder.toLocaleString("zh-TW")} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-[14px] font-semibold text-[#2D2D2D] shrink-0 tabular-nums">
                      NT$ {(item.priceAtOrder * item.quantity).toLocaleString("zh-TW")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center px-5 py-4 bg-[#F7F6F3]">
                <span className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">合計</span>
                <span className="font-jakarta font-bold text-[16px] text-[#7C9070] tabular-nums">
                  NT$ {order.totalAmount.toLocaleString("zh-TW")}
                </span>
              </div>
            </div>

            {/* Order note */}
            {order.note && (
              <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
                <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D] mb-2">
                  訂單備註
                </h2>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{order.note}</p>
              </div>
            )}
          </div>

          {/* Side column */}
          <div className="mt-4 md:mt-0 md:sticky md:top-[80px] space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F7F6F3]">
                <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E]">
                  訂單資訊
                </span>
              </div>
              <div className="divide-y divide-[#F7F6F3]">
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-[12px] text-[#9E9E9E]">下單時間</span>
                  <span className="text-[12px] text-[#2D2D2D]">
                    {new Date(order.createdAt).toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-[12px] text-[#9E9E9E]">付款方式</span>
                  <span className="text-[12px] font-medium text-[#2D2D2D]">
                    {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-[12px] text-[#9E9E9E]">訂單金額</span>
                  <span className="text-[13px] font-bold text-[#7C9070] tabular-nums">
                    NT$ {order.totalAmount.toLocaleString("zh-TW")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank transfer info */}
            {order.paymentMethod === "bank_transfer" && (
              <div className="bg-[#7C9070]/5 border border-[#7C9070]/15 rounded-[16px] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={14} className="text-[#7C9070]" />
                  <span className="text-[12px] font-semibold text-[#7C9070]">銀行轉帳資訊</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">銀行</span>
                    <span className="font-medium text-[#2D2D2D]">玉山銀行 (808)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">帳號</span>
                    <span className="font-medium text-[#2D2D2D] font-mono tracking-wide">
                      1234-5678-9012
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">轉帳金額</span>
                    <span className="font-bold text-[#7C9070] tabular-nums">
                      NT$ {order.totalAmount.toLocaleString("zh-TW")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recipient info */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F7F6F3]">
                <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E]">
                  收件資訊
                </span>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <User size={13} className="text-[#C8C8C8] mt-0.5 shrink-0" />
                  <span className="text-[13px] text-[#2D2D2D]">{order.customer.name}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone size={13} className="text-[#C8C8C8] mt-0.5 shrink-0" />
                    <span className="text-[13px] text-[#2D2D2D]">{order.customer.phone}</span>
                  </div>
                )}
                {order.customer.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={13} className="text-[#C8C8C8] mt-0.5 shrink-0" />
                    <span className="text-[13px] text-[#2D2D2D] leading-relaxed">
                      {order.customer.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* LINE contact */}
            <a
              href="https://line.me/R/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05b04c] text-white font-jakarta font-medium text-[14px] py-3.5 rounded-[12px] transition-colors w-full"
            >
              {LINE_SVG}
              聯絡客服
            </a>

            {/* Refund request */}
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

