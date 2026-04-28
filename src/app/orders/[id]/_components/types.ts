import type { BankTransferSnapshot } from "@/types";

export interface OrderItemData {
  readonly id: string;
  readonly quantity: number;
  readonly priceAtOrder: number;
  readonly product: {
    readonly id: string;
    readonly name: string;
    readonly slug?: string | null;
  };
}

export interface PickupStoreInfo {
  readonly provider?: string;
  readonly storeCode?: string;
  readonly storeName?: string;
  readonly storeAddress?: string;
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
  readonly shippingMethod?: string | null;
  readonly shippingProvider?: string | null;
  readonly pickupStore?: PickupStoreInfo | null;
  readonly trackingNo?: string | null;
  readonly bankTransferInfoSnapshot?: BankTransferSnapshot | null;
  readonly customer: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
    readonly address?: string | null;
  };
  readonly items: OrderItemData[];
}
