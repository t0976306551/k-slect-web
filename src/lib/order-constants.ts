// order-constants.ts — 訂單相關常數與共用元件（前台顯示用）

export const STATUS_LABEL: Record<string, string> = {
  pending_ship: '待出貨',
  shipped: '出貨中',
  completed: '已完成',
  cancelled: '已取消',
  refund_pending: '退款申請中',
  refunded: '已退款',
}

export const STATUS_BG: Record<string, string> = {
  pending_ship: '#FFF3E0',
  shipped: '#E8F0E5',
  completed: '#F0F0F0',
  cancelled: '#FBE9E7',
  refund_pending: '#FFF8E1',
  refunded: '#F3E5F5',
}

export const STATUS_COLOR: Record<string, string> = {
  pending_ship: '#E08020',
  shipped: '#5C7A52',
  completed: '#6B6B6B',
  cancelled: '#D4845E',
  refund_pending: '#D4A020',
  refunded: '#7B6FA2',
}

export const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: '銀行匯款',
  seller_ship: '貨到付款',
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  failed: '付款失敗',
}

export const PAYMENT_STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FFF3E0', fg: '#E08020' },
  paid: { bg: '#E8F0E5', fg: '#5C7A52' },
  failed: { bg: '#FBE9E7', fg: '#D4845E' },
}

export const SHIPPING_METHOD_LABEL: Record<string, string> = {
  cvs_pickup: '超商取貨',
  home_delivery: '宅配到府',
}

export const SHIPPING_PROVIDER_LABEL: Record<string, string> = {
  seven_eleven: '7-11',
  family_mart: '全家',
  black_cat: '黑貓宅急便',
}
