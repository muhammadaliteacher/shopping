export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'CARD',
  CASH: 'CASH',
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
