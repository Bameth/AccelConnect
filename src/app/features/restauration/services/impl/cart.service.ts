import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartSummary } from '../../model/panier.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly SUBSIDY_AMOUNT = 1000;

  private readonly cartItems = signal<CartItem[]>([]);
  private currentUserId = signal<number | null>(null);

  cartSummary = computed<CartSummary>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const amountAfterSubsidy = Math.max(0, subtotal - this.SUBSIDY_AMOUNT);

    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      subsidyAmount: this.SUBSIDY_AMOUNT,
      amountAfterSubsidy,
      deliveryFeesNote: 'Les frais de livraison seront calculés vendredi à 15h',
      items,
    };
  });

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  /**
   * 🔑 Initialise le panier pour un utilisateur spécifique
   */
  initializeForUser(userId: number): void {
    this.currentUserId.set(userId);
    this.loadFromStorage();
  }

  /**
   * 🧹 Nettoie le panier à la déconnexion
   */
  clearUserSession(): void {
    this.cartItems.set([]);
    this.currentUserId.set(null);
  }

  addItem(item: CartItem): void {
    const items = this.cartItems();
    const existingIndex = items.findIndex(
      (i) => i.mealId === item.mealId && i.restaurantId === item.restaurantId
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push({ ...item });
    }

    this.cartItems.set([...items]);
    this.saveToStorage();
  }

  updateQuantity(mealId: number, restaurantId: number, quantity: number): void {
    const items = this.cartItems();
    const index = items.findIndex((i) => i.mealId === mealId && i.restaurantId === restaurantId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
      }

      this.cartItems.set([...items]);
      this.saveToStorage();
    }
  }

  removeItem(mealId: number, restaurantId: number): void {
    const items = this.cartItems().filter(
      (i) => !(i.mealId === mealId && i.restaurantId === restaurantId)
    );
    this.cartItems.set(items);
    this.saveToStorage();
  }

  clear(): void {
    this.cartItems.set([]);
    this.saveToStorage();
  }

  prepareOrderData(): OrderCreationPayload {
    const items = this.cartItems();
    return {
      items: items.map((item) => ({
        mealId: item.mealId,
        restaurantId: item.restaurantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  }

  /**
   * 💾 Sauvegarde avec clé utilisateur unique
   */
  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.currentUserId();
      if (userId !== null) {
        const storageKey = `accel_cart_user_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(this.cartItems()));
      }
    }
  }

  /**
   * 📂 Chargement avec clé utilisateur unique
   */
  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.currentUserId();
      if (userId !== null) {
        const storageKey = `accel_cart_user_${userId}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          try {
            const items = JSON.parse(stored) as CartItem[];
            this.cartItems.set(items);
          } catch (e) {
            console.error('❌ Erreur chargement panier:', e);
            this.cartItems.set([]);
          }
        } else {
          this.cartItems.set([]);
        }
      }
    }
  }

  cartItemCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });
}

export interface OrderCreationPayload {
  items: {
    mealId: number;
    restaurantId: number;
    quantity: number;
    unitPrice: number;
  }[];
}