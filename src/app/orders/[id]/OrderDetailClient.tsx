"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Package,
  RotateCcw,
  MapPin,
  Phone,
  User,
  Landmark,
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
  pending_ship: "#FF9800",
  shipped: "#5C7A52",
  completed: "#6B6B6B",
  cancelled: "#D4845E",
  refund_pending: "#F9A825",
  refunded: "#7B1FA2",
};

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "銀行轉帳",
  seller_ship: "貨到付款",
};

// 進度步驟對應
const PROGRESS_STEPS = [
  { key: "pending", label: "下單" },
  { key: "confirmed", label: "付款" },
  { key: "shipped", label: "出貨" },
  { key: "completed", label: "收貨" },
];

const STATUS_PROGRESS: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  completed: 3,
  cancelled: -1,
};

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <p className="text-[15px] text-[#D4845E] mb-4">
          {error ?? "找不到此訂單"}
        </p>
        <Link href="/orders" className="text-[#7C9070] text-[14px] underline">
          返回訂單列表
        </Link>
      </div>
    );
  }

  const progressIdx = STATUS_PROGRESS[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";

  return (
    <>
      {/* ===== 手機版 (md 以下) ===== */}
      <div className="md:hidden">
        {/* Header */}
        <div
          className="bg-white flex items-center justify-between px-4"
          style={{ height: 54 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 -ml-1"
            aria-label="返回"
          >
            <ArrowLeft size={20} className="text-[#2D2D2D]" />
          </button>
          <span className="text-[16px] font-bold text-[#2D2D2D]">
            訂單詳情
          </span>
          <div className="w-9" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-3">
          {/* 訂單號 + 狀態 */}
          <div className="bg-white rounded-[12px] border border-[#F0EFEC] px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#2D2D2D] font-mono">
              #{order.id.slice(0, 16)}
            </span>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: STATUS_BG[order.status] ?? "#F0F0F0",
                color: STATUS_COLOR[order.status] ?? "#6B6B6B",
              }}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>

          {/* 物流進度 */}
          {!isCancelled && (
            <div className="bg-white rounded-[12px] border border-[#F0EFEC] p-4">
              <p className="text-[13px] font-bold text-[#2D2D2D] mb-4">
                物流進度
              </p>
              <div className="flex items-start">
                {PROGRESS_STEPS.map((step, idx) => {
                  const done = idx <= progressIdx;
                  const active = idx === progressIdx;
                  const isLast = idx === PROGRESS_STEPS.length - 1;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        <div
                          className="w-full h-[2px] flex-1"
                          style={{
                            background:
                              idx === 0 ? "transparent" : done ? "#7C9070" : "#E8E8E8",
                          }}
                        />
                        <div
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                          style={{
                            background: done ? "#7C9070" : "#E8E8E8",
                          }}
                        >
                          {done && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div
                          className="w-full h-[2px] flex-1"
                          style={{
                            background:
                              isLast
                                ? "transparent"
                                : idx < progressIdx
                                ? "#7C9070"
                                : "#E8E8E8",
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] mt-1.5 font-medium"
                        style={{ color: done ? "#7C9070" : "#BBBBBB" }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 商品清單 */}
          <div className="bg-white rounded-[12px] border border-[#F0EFEC] p-4">
            <p className="text-[13px] font-bold text-[#2D2D2D] mb-3">
              商品清單
            </p>
            <div className="flex flex-col gap-3">
              {order.items.map((item, idx) => (
                <div key={item.id}>
                  {idx > 0 && (
                    <div className="border-t border-[#F0EFEC] mb-3" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-[8px] bg-[#F7F6F3] flex items-center justify-center shrink-0">
                      <Package size={18} className="text-[#C0C0C0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#2D2D2D] leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-[12px] text-[#7C9070] mt-0.5">
                        ×{item.quantity} · NT$
                        {(item.priceAtOrder * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F0EFEC] mt-3 pt-3 flex justify-between items-center">
              <span className="text-[13px] font-bold text-[#2D2D2D]">
                訂單總計
              </span>
              <span className="text-[16px] font-bold text-[#7C9070]">
                NT${order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 銀行轉帳資訊 */}
          {order.paymentMethod === "bank_transfer" && (
            <div
              className="rounded-[12px] p-4"
              style={{ background: "rgba(124,144,112,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={15} className="text-[#7C9070]" />
                <span className="text-[13px] font-bold text-[#7C9070]">
                  銀行轉帳資訊
                </span>
              </div>
              <div className="flex flex-col gap-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">銀行</span>
                  <span className="font-semibold text-[#2D2D2D]">
                    玉山銀行 (808)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">帳號</span>
                  <span className="font-semibold text-[#2D2D2D]">
                    1234-5678-9012
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">金額</span>
                  <span className="font-bold text-[13px] text-[#7C9070]">
                    NT${order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 桌面版 (md 以上) ===== */}
      <div className="hidden md:block max-w-[1200px] mx-auto px-8 py-8">
        {/* 麵包屑 */}
        <div className="flex items-center gap-2 text-[13px] text-[#9E9E9E] mb-5">
          <Link href="/" className="hover:text-[#7C9070] transition-colors">
            首頁
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/orders"
            className="hover:text-[#7C9070] transition-colors"
          >
            我的訂單
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#2D2D2D]">訂單詳情</span>
        </div>

        {/* 訂單標題列 */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-[24px] font-bold text-[#2D2D2D]">
            訂單 #{order.id.slice(0, 16)}
          </h1>
          <span
            className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{
              background: STATUS_BG[order.status] ?? "#F0F0F0",
              color: STATUS_COLOR[order.status] ?? "#6B6B6B",
            }}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <div className="flex-1" />
          <span className="text-[13px] text-[#9E9E9E]">
            {new Date(order.createdAt).toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            下訂
          </span>
        </div>

        {/* 主要內容：兩欄 */}
        <div className="flex gap-5 items-start">
          {/* 左欄 */}
          <div className="flex-1 flex flex-col gap-4">
            {/* 物流追蹤 */}
            {!isCancelled && (
              <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-6">
                <p className="text-[16px] font-bold text-[#2D2D2D] mb-6">
                  物流追蹤
                </p>
                <div className="flex items-start gap-0">
                  {PROGRESS_STEPS.map((step, idx) => {
                    const done = idx <= progressIdx;
                    const isLast = idx === PROGRESS_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center w-full">
                          <div
                            className="flex-1 h-[2px]"
                            style={{
                              background:
                                idx === 0
                                  ? "transparent"
                                  : done
                                  ? "#7C9070"
                                  : "#E8E8E8",
                            }}
                          />
                          <div
                            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                            style={{ background: done ? "#7C9070" : "#E8E8E8" }}
                          >
                            {done && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
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
                          className="text-[13px] mt-2 font-semibold"
                          style={{ color: done ? "#7C9070" : "#BBBBBB" }}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 訂購商品 */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#F0EFEC]">
                <p className="text-[16px] font-bold text-[#2D2D2D]">
                  訂購商品
                </p>
                <span className="text-[13px] text-[#9E9E9E]">
                  共 {order.items.length} 件
                </span>
              </div>
              {order.items.map((item, idx) => (
                <div key={item.id}>
                  {idx > 0 && <div className="border-t border-[#F0EFEC]" />}
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-20 h-20 rounded-[8px] bg-[#F7F6F3] flex items-center justify-center shrink-0">
                      <Package size={24} className="text-[#C0C0C0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#2D2D2D]">
                        {item.product.name}
                      </p>
                      <p className="text-[12px] text-[#9E9E9E] mt-1">
                        數量：{item.quantity}
                      </p>
                      <p className="text-[12px] text-[#9E9E9E]">
                        單價：NT${item.priceAtOrder.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-[15px] font-bold text-[#2D2D2D] shrink-0">
                      NT$
                      {(item.priceAtOrder * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右欄 */}
          <div className="w-[360px] shrink-0 flex flex-col gap-4">
            {/* 收件資訊 */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
              <p className="text-[15px] font-bold text-[#2D2D2D] mb-3">
                收件資訊
              </p>
              <div className="border-t border-[#F0EFEC] mb-3" />
              <div className="flex flex-col gap-2.5 text-[13px]">
                <div className="flex items-start gap-2">
                  <User size={14} className="text-[#9E9E9E] mt-0.5 shrink-0" />
                  <span className="text-[#9E9E9E] w-12 shrink-0">收件人</span>
                  <span className="text-[#2D2D2D] font-medium">
                    {order.customer.name}
                  </span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-start gap-2">
                    <Phone
                      size={14}
                      className="text-[#9E9E9E] mt-0.5 shrink-0"
                    />
                    <span className="text-[#9E9E9E] w-12 shrink-0">電話</span>
                    <span className="text-[#2D2D2D]">
                      {order.customer.phone}
                    </span>
                  </div>
                )}
                {order.customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-[#9E9E9E] mt-0.5 shrink-0"
                    />
                    <span className="text-[#9E9E9E] w-12 shrink-0">地址</span>
                    <span className="text-[#2D2D2D]">
                      {order.customer.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 付款方式 */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
              <p className="text-[15px] font-bold text-[#2D2D2D] mb-3">
                付款方式
              </p>
              <div className="border-t border-[#F0EFEC] mb-3" />
              <div className="flex items-center gap-2 text-[13px] text-[#2D2D2D]">
                <Landmark size={14} className="text-[#9E9E9E]" />
                <span>
                  {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
              {order.paymentMethod === "bank_transfer" && (
                <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">銀行</span>
                    <span className="font-medium text-[#2D2D2D]">
                      玉山銀行 (808)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">帳號</span>
                    <span className="font-medium text-[#2D2D2D]">
                      1234-5678-9012
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 金額摘要 */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
              <p className="text-[15px] font-bold text-[#2D2D2D] mb-3">
                金額摘要
              </p>
              <div className="border-t border-[#F0EFEC] mb-3" />
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">小計</span>
                  <span className="text-[#2D2D2D]">
                    NT${order.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">運費</span>
                  <span className="text-[#2D2D2D]">NT$0</span>
                </div>
              </div>
              <div className="border-t border-[#F0EFEC] mt-3 pt-3 flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#2D2D2D]">
                  合計
                </span>
                <span className="text-[15px] font-bold text-[#7C9070]">
                  NT${order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 申請退款 */}
            {order.status === "completed" && (
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#F0EFEC] rounded-[12px] py-3 text-[14px] font-semibold text-[#D4845E] hover:border-[#D4845E] transition-colors">
                <RotateCcw size={15} />
                申請退款
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
