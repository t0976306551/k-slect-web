import { User, Phone, Store, MapPin } from "lucide-react";
import { SHIPPING_PROVIDER_LABEL } from "@/lib/order-constants";
import type { PickupStoreInfo } from "./types";

interface RecipientCardProps {
  readonly customer: {
    readonly name: string;
    readonly phone: string | null;
    readonly address?: string | null;
  };
  readonly shippingMethod?: string | null;
  readonly pickupStore?: PickupStoreInfo | null;
}

function InfoLine({
  icon,
  children,
}: {
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[#C8C8C8] mt-0.5 shrink-0">{icon}</span>
      <span className="text-[13px] text-[#2D2D2D] leading-relaxed">{children}</span>
    </div>
  );
}

function AddressInfo({
  shippingMethod,
  pickupStore,
  address,
}: {
  readonly shippingMethod?: string | null;
  readonly pickupStore?: PickupStoreInfo | null;
  readonly address?: string | null;
}) {
  if (shippingMethod === "cvs_pickup" && pickupStore?.storeName) {
    const providerLabel = SHIPPING_PROVIDER_LABEL[pickupStore.provider ?? ""] ?? "";
    const separator = pickupStore.provider ? " · " : "";
    const storeCodeSuffix = pickupStore.storeCode ? ` (${pickupStore.storeCode})` : "";
    return (
      <InfoLine icon={<Store size={13} />}>
        {providerLabel}{separator}{pickupStore.storeName}{storeCodeSuffix}
      </InfoLine>
    );
  }

  if (address) {
    return (
      <InfoLine icon={<MapPin size={13} />}>
        {address}
      </InfoLine>
    );
  }

  return null;
}

export default function RecipientCard({
  customer,
  shippingMethod,
  pickupStore,
}: RecipientCardProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F7F6F3]">
        <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E]">
          收件資訊
        </span>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        <InfoLine icon={<User size={13} />}>{customer.name}</InfoLine>
        {customer.phone && (
          <InfoLine icon={<Phone size={13} />}>{customer.phone}</InfoLine>
        )}
        <AddressInfo
          shippingMethod={shippingMethod}
          pickupStore={pickupStore}
          address={customer.address}
        />
      </div>
    </div>
  );
}
