import Link from "next/link";
import { Package } from "lucide-react";
import type { OrderItemData } from "./types";

interface OrderItemListProps {
  readonly items: readonly OrderItemData[];
  readonly totalAmount: number;
}

function ItemRow({ item }: { readonly item: OrderItemData }) {
  const subtotal = item.priceAtOrder * item.quantity;
  const variantEntries = item.variantSnapshot
    ? Object.entries(item.variantSnapshot)
    : [];
  const nameEl = item.product?.slug ? (
    <Link
      href={`/products/${item.product.slug}`}
      className="text-[13px] font-medium text-[#2D2D2D] hover:text-[#7C9070] transition-colors line-clamp-2 leading-snug"
    >
      {item.productName}
    </Link>
  ) : (
    <p className="text-[13px] font-medium text-[#2D2D2D] line-clamp-2 leading-snug">
      {item.productName}
    </p>
  );

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-[10px] bg-[#F7F6F3] flex items-center justify-center shrink-0">
        <Package size={20} className="text-[#C8C8C8]" />
      </div>
      <div className="flex-1 min-w-0">
        {nameEl}
        {variantEntries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {variantEntries.map(([key, value]) => (
              <span
                key={key}
                className="inline-block text-[11px] text-[#6B6B6B] bg-[#F0EFEC] rounded-[4px] px-1.5 py-0.5 leading-none"
              >
                {key}：{value}
              </span>
            ))}
          </div>
        )}
        <p className="text-[12px] text-[#9E9E9E] mt-1 tabular-nums">
          NT$ {item.priceAtOrder.toLocaleString("zh-TW")} × {item.quantity}
        </p>
      </div>
      <span className="text-[14px] font-semibold text-[#2D2D2D] shrink-0 tabular-nums">
        NT$ {subtotal.toLocaleString("zh-TW")}
      </span>
    </div>
  );
}

export default function OrderItemList({ items, totalAmount }: OrderItemListProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F7F6F3] flex items-center justify-between">
        <h2 className="font-fraunces font-medium text-[16px] text-[#2D2D2D]">
          訂購商品
        </h2>
        <span className="text-[12px] text-[#9E9E9E]">共 {items.length} 件</span>
      </div>

      <div className="divide-y divide-[#F7F6F3]">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="flex justify-between items-center px-5 py-4 bg-[#F7F6F3]">
        <span className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">合計</span>
        <span className="font-jakarta font-bold text-[16px] text-[#7C9070] tabular-nums">
          NT$ {totalAmount.toLocaleString("zh-TW")}
        </span>
      </div>
    </div>
  );
}
