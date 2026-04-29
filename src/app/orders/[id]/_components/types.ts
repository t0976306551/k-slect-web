import type { BankTransferSnapshot } from "@/types";

export interface OrderItemData {
  readonly id: string;
  readonly quantity: number;
  readonly priceAtOrder: number;
  readonly productName: string;
  readonly image?: string | null;
  readonly variantSnapshot?: Record<string, string> | null;
  readonly product?: {
    readonly id?: string;
    readonly slug?: string | null;
  } | null;
}

export interface PickupStoreInfo {
  readonly provider?: string | null;
  readonly storeCode?: string | null;
  readonly storeName?: string | null;
  readonly storeAddress?: string | null;
  readonly pickupCode?: string | null;
}

export interface OrderDetail {
  readonly id: string;
  readonly status: string;
  readonly paymentMethod: string;
  readonly paymentStatus: string;
  readonly totalAmount: number;
  readonly note: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly shippingAddress?: string | null;
  readonly shippingMethod?: string | null;
  readonly shippingProvider?: string | null;
  readonly pickupStore?: PickupStoreInfo | null;
  readonly trackingNo?: string | null;
  readonly bankTransferInfoSnapshot?: BankTransferSnapshot | null;
  readonly bankTransferReport?: {
    readonly last5: string;
    readonly transferredAt: string | null;
    readonly note: string | null;
    readonly reportedAt: string;
  } | null;
  readonly customer: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
    readonly address?: string | null;
  };
  readonly items: OrderItemData[];
}
