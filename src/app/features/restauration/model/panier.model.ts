export interface CartItem {
  id: number;
  mealId: number;
  mealName: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
}

export interface Cart {
  id: number;
  userId: number;
  restaurantId: number | null;
  restaurantName: string | null;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface AddToCartRequest {
  mealId: number;
  restaurantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
