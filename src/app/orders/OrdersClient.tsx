"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, ChevronRight, Search, ShoppingBag } from "lucide-react";
import { PAYMENT_LABEL } from "@/lib/order-constants";
import StatusBadge from "@/components/StatusBadge";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  product: { id: string; name: string };
}

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  customer: { id: string; name: string; email: string };
  items: OrderItem[];
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-2.5 w-36 bg-[#F0EFEC] rounded" />
          <div className="h-2.5 w-24 bg-[#F0EFEC] rounded" />
        </div>
        <div className="h-6 w-16 bg-[#F0EFEC] rounded-full" />
      </div>
      <div className="h-2.5 w-48 bg-[#F0EFEC] rounded mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-2.5 w-20 bg-[#F0EFEC] rounded" />
        <div className="h-4 w-20 bg-[#F0EFEC] rounded" />
      </div>
    </div>
  );
}

export default function OrdersClient() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (e: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/orders?email=${encodeURIComponent(e)}&limit=50`
      );
      const json = await res.json();
      if (json.error) {
        setError(json.error.message);
      } else {
        setOrders(json.data.orders ?? []);
      }
    } catch {
      setError("載入失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("customer_email");
    if (stored && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stored)) {
      setEmail(stored);
      setInputEmail(stored);
      fetchOrders(stored);
    }
  }, [fetchOrders]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputEmail.trim();
    if (!trimmed) return;
    setEmail(trimmed);
    localStorage.setItem("customer_email", trimmed);
    fetchOrders(trimmed);
  }

  const hasEmail = Boolean(email);

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-fraunces font-medium text-[28px] md:text-[34px] text-[#2D2D2D] leading-tight">
          我的訂單
        </h1>
        {hasEmail && (
          <p className="text-[13px] text-[#9E9E9E] mt-1">{email}</p>
        )}
      </div>

      {/* Email search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9E9E] pointer-events-none"
          />
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="輸入下單 Email 查詢訂單"
            className="w-full pl-9 pr-4 py-3 text-[14px] bg-white border border-[#E8E8E8] rounded-[10px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-[#7C9070] hover:bg-[#6a7d5f] text-white text-[14px] font-medium rounded-[10px] transition-colors whitespace-nowrap"
        >
          查詢
        </button>
      </form>

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-[12px] px-4 py-3 text-[13px] text-red-500 mb-4">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      )}

      {/* Order list */}
      {!loading && !error && hasEmail && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-[16px] border border-[#F0EFEC] p-4 hover:border-[#D0D0D0] hover:shadow-sm transition-all group"
            >
              {/* Top row: ID + status badge */}
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <p className="text-[11px] font-mono text-[#9E9E9E] leading-none pt-0.5">
                  {order.id.slice(0, 18)}…
                </p>
                <StatusBadge status={order.status} />
              </div>

              {/* Date + payment */}
              <p className="text-[12px] text-[#9E9E9E] mb-3">
                {new Date(order.createdAt).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
                {" · "}
                {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
              </p>

              {/* Product preview + total */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] text-[#2D2D2D] line-clamp-1 flex-1">
                  {order.items[0]?.product.name ?? "—"}
                  {order.items.length > 1 && (
                    <span className="text-[#9E9E9E]">
                      {" "}等 {order.items.length} 件
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-jakarta font-semibold text-[14px] text-[#2D2D2D] tabular-nums">
                    NT$ {order.totalAmount.toLocaleString("zh-TW")}
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-[#C8C8C8] group-hover:text-[#7C9070] transition-colors"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty — has email but no orders */}
      {!loading && !error && hasEmail && orders.length === 0 && (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-[#F0EFEC] flex items-center justify-center">
            <Package size={26} className="text-[#C8C8C8]" />
          </div>
          <div>
            <p className="font-jakarta font-medium text-[15px] text-[#2D2D2D]">
              尚無訂單紀錄
            </p>
            <p className="text-[13px] text-[#9E9E9E] mt-1">
              還沒有下過單？快去挑選喜愛的韓貨吧！
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C9070] hover:bg-[#6a7d5f] text-white text-[14px] font-medium rounded-[10px] transition-colors"
          >
            <ShoppingBag size={15} />
            去逛逛
          </Link>
        </div>
      )}

      {/* Pre-search prompt */}
      {!loading && !hasEmail && (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-[#F0EFEC] flex items-center justify-center">
            <Package size={26} className="text-[#C8C8C8]" />
          </div>
          <p className="text-[14px] text-[#9E9E9E]">
            輸入下單時的 Email 即可查詢訂單
          </p>
        </div>
      )}
    </div>
  );
}
