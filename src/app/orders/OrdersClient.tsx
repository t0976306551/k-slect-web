"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, ChevronRight, Search, ShoppingBag } from "lucide-react";

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

const STATUS_LABEL: Record<string, string> = {
  pending: "待確認",
  confirmed: "已確認",
  shipped: "出貨中",
  completed: "已完成",
  cancelled: "已取消",
};

const STATUS_BG: Record<string, string> = {
  pending: "#FFF3E0",
  confirmed: "#EBF1E8",
  shipped: "#E8F0E5",
  completed: "#F0F0F0",
  cancelled: "#FBE9E7",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#7C9070",
  shipped: "#5C7A52",
  completed: "#6B6B6B",
  cancelled: "#D4845E",
};

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "銀行轉帳",
  seller_ship: "貨到付款",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        background: STATUS_BG[status] ?? "#F0F0F0",
        color: STATUS_COLOR[status] ?? "#6B6B6B",
      }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
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
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-[22px] md:text-[26px] font-semibold text-[#2D2D2D]">
          我的訂單
        </h1>
        {hasEmail && (
          <p className="text-[13px] text-[#9E9E9E] mt-1">{email}</p>
        )}
      </div>

      {/* Email 查詢表單 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
          />
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="輸入下單 Email 查詢訂單"
            className="w-full pl-9 pr-4 py-2.5 text-[14px] bg-white border border-[#E8E8E8] rounded-[10px] text-[#2D2D2D] placeholder:text-[#C0C0C0] focus:outline-none focus:border-[#7C9070] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#7C9070] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#6B7F60] transition-colors whitespace-nowrap"
        >
          查詢
        </button>
      </form>

      {/* 狀態 */}
      {loading && (
        <div className="py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
          <p className="text-[14px] text-[#9E9E9E]">載入中…</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-[#FBE9E7] text-[#D4845E] text-[14px] px-4 py-3 rounded-[10px] mb-4">
          {error}
        </div>
      )}

      {/* 訂單列表 */}
      {!loading && !error && hasEmail && orders.length === 0 && (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <Package size={32} className="text-[#C0C0C0]" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-[#2D2D2D]">尚無訂單</p>
            <p className="text-[13px] text-[#9E9E9E] mt-1">
              還沒有下過單，快去挑選喜愛的韓貨吧！
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7C9070] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#6B7F60] transition-colors"
          >
            <ShoppingBag size={16} />
            去逛逛
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-[16px] border border-[#F0EFEC] p-4 hover:border-[#D0D0D0] transition-colors group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-mono text-[#9E9E9E] mb-0.5">
                    {order.id.slice(0, 16)}…
                  </p>
                  <p className="text-[13px] text-[#6B6B6B]">
                    {new Date(order.createdAt).toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                    　{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} />
                  <ChevronRight
                    size={16}
                    className="text-[#C0C0C0] group-hover:text-[#7C9070] transition-colors"
                  />
                </div>
              </div>

              {/* 商品預覽 */}
              <div className="text-[13px] text-[#6B6B6B] mb-3 line-clamp-1">
                {order.items[0]?.product.name ?? "—"}
                {order.items.length > 1 && (
                  <span className="text-[#9E9E9E]">
                    {" "}
                    等 {order.items.length} 件商品
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="w-8 h-8 rounded-[6px] bg-[#F7F6F3] flex items-center justify-center"
                    >
                      <Package size={14} className="text-[#C0C0C0]" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-8 h-8 rounded-[6px] bg-[#F0EFEC] flex items-center justify-center text-[11px] text-[#9E9E9E]">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <p className="text-[15px] font-semibold text-[#2D2D2D]">
                  NT${order.totalAmount.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 未輸入 email 提示 */}
      {!loading && !hasEmail && (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <Package size={32} className="text-[#C0C0C0]" />
          </div>
          <p className="text-[14px] text-[#9E9E9E]">
            輸入下單時的 Email 即可查詢訂單
          </p>
        </div>
      )}
    </div>
  );
}
