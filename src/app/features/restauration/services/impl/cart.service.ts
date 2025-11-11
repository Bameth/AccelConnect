import { Injectable, signal, computed, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartSummary } from '../../model/panier.model';
import { MenuClientService } from './menu.client.service';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly SUBSIDY_AMOUNT = 1000;
  private readonly menuClientService = inject(MenuClientService);

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
    this.validateCartItems(); // Valide les items au chargement
  }

  /**
   * ✅ Valide que tous les items du panier sont toujours disponibles dans le menu du jour
   */
  validateCartItems(): Observable<{ validItems: CartItem[]; removedItems: CartItem[] }> {
    const items = this.cartItems();

    if (items.length === 0) {
      return of({ validItems: [], removedItems: [] });
    }

    // Récupérer les menus du jour
    return this.menuClientService.getMenusByDate(this.getTodayDate()).pipe(
      map((menus) => {
        const validItems: CartItem[] = [];
        const removedItems: CartItem[] = [];

        items.forEach((item) => {
          // Trouver le menu du restaurant
          const menu = menus.find((m) => m.restaurantId === item.restaurantId);

          if (menu) {
            // Vérifier si le plat existe toujours dans le menu
            const mealExists = menu.meals?.some((meal) => meal.id === item.mealId);

            if (mealExists) {
              validItems.push(item);
            } else {
              removedItems.push(item);
            }
          } else {
            // Le restaurant n'a pas de menu aujourd'hui
            removedItems.push(item);
          }
        });

        // Mettre à jour le panier avec seulement les items valides
        if (removedItems.length > 0) {
          this.cartItems.set(validItems);
          this.saveToStorage();
        }

        return { validItems, removedItems };
      })
    );
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
   * 📅 Obtient la date du jour au format YYYY-MM-DD
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 💾 Sauvegarde avec clé utilisateur unique et date
   */
  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.currentUserId();
      if (userId !== null) {
        const storageKey = `accel_cart_user_${userId}`;
        const cartData = {
          items: this.cartItems(),
          savedDate: this.getTodayDate(),
        };
        localStorage.setItem(storageKey, JSON.stringify(cartData));
      }
    }
  }

  /**
   * 📂 Chargement avec validation de date
   */
  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.currentUserId();
      if (userId !== null) {
        const storageKey = `accel_cart_user_${userId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          try {
            const cartData = JSON.parse(stored);
            const savedDate = cartData.savedDate;
            const today = this.getTodayDate();

            if (savedDate === today) {
              this.cartItems.set(cartData.items as CartItem[]);
            } else {
              this.cartItems.set([]);
              this.saveToStorage();
            }
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
