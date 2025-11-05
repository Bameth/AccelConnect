export interface OrderItem {
  id: number;
  mealId: number;
  mealName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  userId: number;
  username: string;
  restaurantId: number;
  restaurantName: string;
  orderDate: string;
  subtotal: number;
  deliveryFeeShare: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export interface TodayOrderStats {
  date: string;
  totalOrders: number;
  totalAmount: number;
  confirmedCount: number;
  cancelledCount: number;
  restaurantStats: RestaurantOrderStats[];
}

export interface RestaurantOrderStats {
  restaurantId: number;
  restaurantName: string;
  orderCount: number;
  totalAmount: number;
  deliveryFee: number;
  orders: AdminOrder[];
}

export interface OrderFilters {
  date?: string;
  month?: string;
  year?: string;
  restaurantId?: number;
  status?: 'CONFIRMED' | 'CANCELLED' | 'ALL';
  searchTerm?: string;
}
