import {
  PAYMENT_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  SHIPPING_METHOD_LABEL,
  SHIPPING_PROVIDER_LABEL,
} from "@/lib/order-constants";

interface OrderSummaryCardProps {
  readonly createdAt: string;
  readonly paymentMethod: string;
  readonly paymentStatus: string;
  readonly totalAmount: number;
  readonly shippingMethod?: string | null;
  readonly shippingProvider?: string | null;
  readonly trackingNo?: string | null;
}

function InfoRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center px-5 py-3">
      <span className="text-[12px] text-[#9E9E9E]">{label}</span>
      {children}
    </div>
  );
}

export default function OrderSummaryCard({
  createdAt,
  paymentMethod,
  paymentStatus,
  totalAmount,
  shippingMethod,
  shippingProvider,
  trackingNo,
}: OrderSummaryCardProps) {
  const dateStr = new Date(createdAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const statusColor = PAYMENT_STATUS_COLOR[paymentStatus];

  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F7F6F3]">
        <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E]">
          訂單資訊
        </span>
      </div>
      <div className="divide-y divide-[#F7F6F3]">
        <InfoRow label="下單時間">
          <span className="text-[12px] text-[#2D2D2D]">{dateStr}</span>
        </InfoRow>
        <InfoRow label="付款方式">
          <span className="text-[12px] font-medium text-[#2D2D2D]">
            {PAYMENT_LABEL[paymentMethod] ?? paymentMethod}
          </span>
        </InfoRow>
        <InfoRow label="付款狀態">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: statusColor?.bg ?? "#F0F0F0",
              color: statusColor?.fg ?? "#6B6B6B",
            }}
          >
            {PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
          </span>
        </InfoRow>
        {shippingMethod && (
          <InfoRow label="配送方式">
            <span className="text-[12px] font-medium text-[#2D2D2D]">
              {SHIPPING_METHOD_LABEL[shippingMethod] ?? shippingMethod}
              {shippingProvider &&
                ` · ${SHIPPING_PROVIDER_LABEL[shippingProvider] ?? shippingProvider}`}
            </span>
          </InfoRow>
        )}
        {trackingNo && (
          <InfoRow label="追蹤編號">
            <span className="text-[12px] font-mono text-[#2D2D2D]">{trackingNo}</span>
          </InfoRow>
        )}
        <InfoRow label="訂單金額">
          <span className="text-[13px] font-bold text-[#7C9070] tabular-nums">
            NT$ {totalAmount.toLocaleString("zh-TW")}
          </span>
        </InfoRow>
      </div>
    </div>
  );
}
