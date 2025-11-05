export enum OrderStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: number;
  userId: number;
  username: string;
  restaurantId: number;
  restaurantName: string;
  orderDate: string;
  subtotal: number;
  deliveryFeeShare: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  mealId: number;
  mealName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFeeShare: number;
  totalAmount: number;
  totalOrdersForRestaurant: number;
  message: string;
}

export interface CreateOrderRequest {
  deliveryDate?: string;
}

// Filtres disponibles pour les commandes
export const ORDER_FILTERS = [
  { value: 'all', label: 'Toutes', icon: 'list' },
  { value: OrderStatus.CONFIRMED, label: 'Confirmées', icon: 'check-circle' },
  { value: OrderStatus.CANCELLED, label: 'Annulées', icon: 'times-circle' },
] as const;

export type OrderFilterValue = 'all' | OrderStatus;
