import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RestaurantService } from './services/impl/restaurant.service';
import { MenuClientService } from './services/impl/menu.client.service';
import { CartService } from './services/impl/cart.service';
import { NotificationService } from '../../core/services/impl/notification.service';
import { RestaurantDisplay, Stat } from './model/display.model';
import { UserBalanceDTO } from './model/balance.model';
import { Restaurant } from './model/restaurant.model';
import { UserBalanceService } from './services/impl/userBalance.service';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { CartItem } from './model/panier.model';

@Component({
  selector: 'app-restauration',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, LottieComponent],
  templateUrl: './restauration.component.html',
  styleUrl: './restauration.component.css',
})
export class RestaurationComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly menuClientService = inject(MenuClientService);
  protected readonly cartService = inject(CartService);
  private readonly userBalanceService = inject(UserBalanceService);
  private readonly notificationService = inject(NotificationService);

  // State
  restaurants = signal<RestaurantDisplay[]>([]);
  userBalance = signal<UserBalanceDTO | null>(null);
  selectedDate = signal<string>(this.getTodayDate());
  selectedDay = signal<string>("Aujourd'hui");
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Jours de la semaine
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  // Stats computed
  stats = computed<Stat[]>(() => {
    const balance = this.userBalance();
    if (!balance) {
      return [
        {
          id: 'deposited',
          label: 'Déposé',
          value: '0',
          icon: 'wallet',
          gradientFrom: '#3B82F6',
          gradientTo: '#1D4ED8',
        },
        {
          id: 'spent',
          label: 'Dépensé',
          value: '0',
          icon: 'shopping-bag',
          gradientFrom: '#EF4444',
          gradientTo: '#DC2626',
        },
        {
          id: 'balance',
          label: 'Remboursements/Dettes',
          value: '0',
          icon: 'chart-line',
          gradientFrom: '#10B981',
          gradientTo: '#059669',
        },
      ];
    }

    return [
      {
        id: 'deposited',
        label: 'Déposé',
        value: this.formatAmount(balance.totalDeposited),
        icon: 'wallet',
        gradientFrom: '#3B82F6',
        gradientTo: '#1D4ED8',
      },
      {
        id: 'spent',
        label: 'Dépensé',
        value: this.formatAmount(balance.totalSpent),
        icon: 'shopping-bag',
        gradientFrom: '#EF4444',
        gradientTo: '#DC2626',
      },
      {
        id: 'balance',
        label: 'Remboursements/Dettes',
        value: this.formatAmount(balance.balance),
        icon: balance.hasDebt
          ? 'exclamation-triangle'
          : balance.balance > 0
          ? 'check-circle'
          : 'equals',
        gradientFrom: balance.hasDebt ? '#EF4444' : balance.balance > 0 ? '#10B981' : '#6B7280',
        gradientTo: balance.hasDebt ? '#DC2626' : balance.balance > 0 ? '#059669' : '#4B5563',
      },
    ];
  });

  // Computed: Nombre total d'items sélectionnés
  getTotalSelectedItems(): number {
    return this.restaurants().reduce((total, restaurant) => {
      return total + restaurant.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  }

  ngOnInit(): void {
    this.loadUserBalance();
    this.loadRestaurantsWithMenus();
    import('../../../../../AccelConnectFront/src/assets/lottie/3DChefDancing.json').then(
      (animationData) => {
        this.lottieOptions = {
          animationData: animationData.default,
        };
      }
    );
  }

  /**
   * 💰 Charge le solde utilisateur
   */
  loadUserBalance(): void {
    this.userBalanceService.getMyBalance().subscribe({
      next: (balance) => {
        this.userBalance.set(balance);
        console.log('💰 Solde utilisateur:', balance);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du solde:', error);
        // Ne pas bloquer l'affichage si le solde ne charge pas
      },
    });
  }

  /**
   * 🍽️ Charge les restaurants et leurs menus
   */
  loadRestaurantsWithMenus(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants: Restaurant[]) => {
        this.menuClientService.getRestaurantsWithTodayMenus(restaurants).subscribe({
          next: (restaurantsWithMenus) => {
            const display = this.mapToDisplay(restaurantsWithMenus);
            this.restaurants.set(display);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('❌ Erreur menus:', error);
            this.errorMessage.set('Impossible de charger les menus du jour');
            this.isLoading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('❌ Erreur restaurants:', error);
        this.errorMessage.set('Impossible de charger les restaurants');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * 📅 Sélectionne un jour
   */
  selectDay(day: string): void {
    this.selectedDay.set(day);
    // TODO: Implémenter la navigation par jour
    this.notificationService.info('Fonction à venir', `Navigation vers ${day}`);
  }

  /**
   * ➕ Augmente la quantité d'un plat
   */
  increaseQuantity(restaurantId: number, itemId: number): void {
    const updated = this.restaurants().map((restaurant) => {
      if (restaurant.id === restaurantId) {
        return {
          ...restaurant,
          items: restaurant.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return restaurant;
    });
    this.restaurants.set(updated);
  }

  /**
   * ➖ Diminue la quantité d'un plat
   */
  decreaseQuantity(restaurantId: number, itemId: number): void {
    const updated = this.restaurants().map((restaurant) => {
      if (restaurant.id === restaurantId) {
        return {
          ...restaurant,
          items: restaurant.items.map((item) =>
            item.id === itemId && item.quantity > 0
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        };
      }
      return restaurant;
    });
    this.restaurants.set(updated);
  }

  /**
   * 🛒 Ajoute tous les plats sélectionnés au panier
   */
  addAllToCart(): void {
    const allItems: CartItem[] = [];

    // Collecter tous les items avec quantity > 0
    this.restaurants().forEach((restaurant) => {
      restaurant.items.forEach((item) => {
        if (item.quantity > 0) {
          allItems.push({
            mealId: item.id!,
            mealName: item.mealName,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          });
        }
      });
    });

    if (allItems.length === 0) {
      this.notificationService.warning('Sélection vide', 'Veuillez sélectionner au moins un plat');
      return;
    }

    // Ajouter au panier avec les quantités correctes
    allItems.forEach((item) => {
      this.cartService.addItem(item);
    });

    // Réinitialiser les quantités
    this.resetAllQuantities();

    this.notificationService.success(
      'Ajouté au panier',
      `${allItems.length} article(s) ajouté(s) avec succès`
    );
  }

  /**
   * 🔄 Réinitialise toutes les quantités
   */
  resetAllQuantities(): void {
    const updated = this.restaurants().map((restaurant) => ({
      ...restaurant,
      items: restaurant.items.map((item) => ({ ...item, quantity: 0 })),
    }));
    this.restaurants.set(updated);
  }

  /**
   * 📊 Formate un montant
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * 🏷️ Vérifie si c'est le weekend
   */
  isWeekend(dateStr: string): boolean {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
  }

  // Utilitaires
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private mapToDisplay(data: any[]): RestaurantDisplay[] {
    const gradients = [
      { from: '#EF4444', to: '#DC2626', border: 'red-500' },
      { from: '#F59E0B', to: '#D97706', border: 'orange-500' },
      { from: '#10B981', to: '#059669', border: 'green-500' },
      { from: '#3B82F6', to: '#2563EB', border: 'blue-500' },
      { from: '#8B5CF6', to: '#7C3AED', border: 'purple-500' },
    ];

    return data.map((rwm, idx) => {
      const gradient = gradients[idx % gradients.length];

      return {
        id: rwm.restaurant.id,
        name: rwm.restaurant.restaurantName,
        subtitle: `Livraison: ${rwm.restaurant.deliveryFee} FCFA`,
        icon: 'utensils',
        gradientFrom: gradient.from,
        gradientTo: gradient.to,
        hasMenu: rwm.hasMenu,
        items: (rwm.menu?.meals || []).map((meal: any, mealIdx: number) => ({
          id: meal.id,
          mealName: meal.mealName,
          unitPrice: meal.unitPrice,
          description: meal.description,
          imageUrl: meal.imageUrl,
          quantity: 0,
          gradientFrom: gradient.from,
          gradientTo: gradient.to,
          hoverBorder: gradient.border,
        })),
      };
    });
  }

  // Animation Lottie
  lottieOptions: AnimationOptions = {
    path: '', // will be filled dynamically
  };

  onAnimationCreated(anim: any): void {
    console.log('Animation créée:', anim);
  }
}
