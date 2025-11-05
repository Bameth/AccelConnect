import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { RouterModule } from '@angular/router';
import { RestaurantService } from './services/impl/restaurant.service';
import { MenuClientService } from './services/impl/menu.client.service';

import {
  MealDisplay,
  RestaurantDisplay,
  RestaurantWithMenu,
  Stat,
} from './model/menuMealRestau.model';
import { WalletService } from './services/impl/wallet.service';
import { CartServiceImpl } from './services/impl/cart.service';
import { WalletBalance } from './model/wallet.model';
import { NotificationService } from '../../core/services/impl/notification.service';

@Component({
  selector: 'app-restauration-component',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FaIconComponent, LottieComponent, RouterModule],
  templateUrl: './restauration-component.html',
  styleUrl: './restauration-component.css',
})
export class RestaurationComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly menuClientService = inject(MenuClientService);
  private readonly notificationService = inject(NotificationService);
  private readonly walletService = inject(WalletService);
  protected readonly cartService = inject(CartServiceImpl);

  restaurants = signal<RestaurantDisplay[]>([]);
  selectedDate = signal<string>(this.getTodayDate());
  selectedDay = signal<string>('');
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  walletBalance = signal<WalletBalance | null>(null);

  days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  stats = signal<Stat[]>([
    {
      id: 'credit',
      label: 'Solde Créditeur',
      value: '0',
      icon: 'wallet',
      gradientFrom: '#14B8A6',
      gradientTo: '#10B981',
    },
    {
      id: 'debit',
      label: 'Solde Débiteur',
      value: '0',
      icon: 'chart-line',
      gradientFrom: '#EF4444',
      gradientTo: '#EA580C',
    },
  ]);

  // Configurations des restaurants (couleurs et icônes)
  private readonly restaurantConfigs = [
    {
      icon: 'fire',
      gradientFrom: '#E84141',
      gradientTo: '#6B140F',
    },
    {
      icon: 'drumstick-bite',
      gradientFrom: '#303131',
      gradientTo: '#20264E',
    },
    {
      icon: 'star',
      gradientFrom: '#25509D',
      gradientTo: '#99CFBD',
    },
    {
      icon: 'utensils',
      gradientFrom: '#059669',
      gradientTo: '#10B981',
    },
    {
      icon: 'pepper-hot',
      gradientFrom: '#DC2626',
      gradientTo: '#F97316',
    },
  ];

  // Couleurs pour les plats
  private readonly mealStyles = [
    { gradientFrom: '#E84141', gradientTo: '#FF6B35', hoverBorder: 'red-200' },
    { gradientFrom: '#14B8A6', gradientTo: '#10B981', hoverBorder: 'teal-200' },
    { gradientFrom: '#2563EB', gradientTo: '#6366F1', hoverBorder: 'blue-200' },
    { gradientFrom: '#D97706', gradientTo: '#C2410C', hoverBorder: 'amber-200' },
    { gradientFrom: '#14B8A6', gradientTo: '#06B6D4', hoverBorder: 'teal-200' },
    { gradientFrom: '#3B82F6', gradientTo: '#A855F7', hoverBorder: 'purple-200' },
    { gradientFrom: '#22C55E', gradientTo: '#10B981', hoverBorder: 'emerald-200' },
    { gradientFrom: '#3B82F6', gradientTo: '#14B8A6', hoverBorder: 'teal-200' },
  ];

  // Animations Lottie
  lottieOptions: AnimationOptions = {
    path: '/assets/lottie/3DChefDancing.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  weekendLottieOptions: AnimationOptions = {
    path: '/assets/lottie/relax.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  ngOnInit(): void {
    this.selectedDay.set(this.getCurrentDayName());
    this.loadWalletBalance();
    this.loadRestaurantsWithMenus();
  }

  /**
   * Charge le solde du wallet
   */
  loadWalletBalance(): void {
    this.walletService.getBalance().subscribe({
      next: (balance) => {
        this.walletBalance.set(balance);
        this.updateStats(balance);
        console.log('💰 Solde chargé:', balance);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du solde:', error);
      },
    });
  }
  /**
   * Met à jour les statistiques affichées
   */
  updateStats(balance: WalletBalance): void {
    if (balance.hasCredit) {
      // Utilisateur en crédit (solde négatif)
      this.stats.set([
        {
          id: 'credit',
          label: 'Crédit en cours',
          value: this.formatBalance(balance.creditAmount),
          icon: 'exclamation-triangle',
          gradientFrom: '#EF4444',
          gradientTo: '#DC2626',
        },
        {
          id: 'debit',
          label: 'Total Dépensé',
          value: this.formatBalance(balance.debitBalance),
          icon: 'chart-line',
          gradientFrom: '#F59E0B',
          gradientTo: '#D97706',
        },
      ]);
    } else if (balance.balance === 0) {
      // Aucun solde
      this.stats.set([
        {
          id: 'credit',
          label: 'Solde Actuel',
          value: '0',
          icon: 'wallet',
          gradientFrom: '#6B7280',
          gradientTo: '#4B5563',
        },
        {
          id: 'debit',
          label: 'Commande à crédit',
          icon: 'check-circle',
          value: '0',
          gradientFrom: '#14B8A6',
          gradientTo: '#10B981',
        },
      ]);
    } else {
      // Solde positif
      this.stats.set([
        {
          id: 'credit',
          label: 'Solde Créditeur',
          value: this.formatBalance(balance.creditBalance),
          icon: 'wallet',
          gradientFrom: '#14B8A6',
          gradientTo: '#10B981',
        },
        {
          id: 'debit',
          label: 'Total Dépensé',
          value: this.formatBalance(balance.debitBalance),
          icon: 'chart-line',
          gradientFrom: '#EF4444',
          gradientTo: '#EA580C',
        },
      ]);
    }
  }

  /**
   * Formate le solde en K (milliers)
   */
  formatBalance(amount: number): string {
    if (amount >= 1000) {
      return Math.floor(amount / 1000) + 'K';
    }
    return amount.toString();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentDayName(): string {
    const date = new Date();
    const dayIndex = date.getDay();

    if (dayIndex === 0 || dayIndex === 6) {
      return 'Lundi';
    }

    return this.days[dayIndex - 1] ?? 'Lundi';
  }

  isWeekend(date: string): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }

  getCurrentWeekendMessage(): { title: string; subtitle: string } {
    const date = new Date(this.selectedDate());
    const day = date.getDay();

    if (day === 6) {
      return {
        title: 'Bon Samedi ! 🎉',
        subtitle: 'Profitez de votre weekend, nos cuisines sont fermées',
      };
    } else {
      return {
        title: 'Bon Dimanche ! ☀️',
        subtitle: 'Reposez-vous bien, on se retrouve lundi',
      };
    }
  }

  loadRestaurantsWithMenus(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.menuClientService.getRestaurantsWithTodayMenus(restaurants).subscribe({
          next: (restaurantsWithMenus) => {
            const displayRestaurants = this.mapToDisplayRestaurants(restaurantsWithMenus);
            this.restaurants.set(displayRestaurants);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des menus:', error);
            this.errorMessage.set('Impossible de charger les menus du jour');
            this.isLoading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des restaurants:', error);
        this.errorMessage.set('Impossible de charger les restaurants');
        this.isLoading.set(false);
      },
    });
  }

  mapToDisplayRestaurants(restaurantsWithMenus: RestaurantWithMenu[]): RestaurantDisplay[] {
    return restaurantsWithMenus.map((rwm, index) => {
      const config = this.restaurantConfigs[index % this.restaurantConfigs.length];

      const items: MealDisplay[] =
        rwm.menu?.meals?.map((meal, mealIndex) => {
          const style = this.mealStyles[mealIndex % this.mealStyles.length];
          return {
            ...meal,
            quantity: 0,
            imageUrl: (meal as any).imageUrl || null,
            gradientFrom: style.gradientFrom,
            gradientTo: style.gradientTo,
            hoverBorder: style.hoverBorder,
          };
        }) || [];

      return {
        id: rwm.restaurant.id,
        name: rwm.restaurant.restaurant_name,
        subtitle: rwm.hasMenu ? `${rwm.itemCount} plats disponibles` : "Aucun menu aujourd'hui",
        logoUrl: (rwm.restaurant as any).logoUrl || null,
        icon: config.icon,
        gradientFrom: config.gradientFrom,
        gradientTo: config.gradientTo,
        hasMenu: rwm.hasMenu,
        items,
      };
    });
  }

  selectDay(day: string): void {
    this.selectedDay.set(day);
    const dayIndex = this.days.indexOf(day);
    const date = this.getDateForDay(dayIndex);
    this.selectedDate.set(date);
    this.loadMenusForDate(date);
  }

  getDateForDay(dayIndex: number): string {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = dayIndex + 1 - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  }

  loadMenusForDate(date: string): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.restaurantService.getRestaurants().subscribe({
        next: (restaurants) => {
          this.menuClientService.getRestaurantsWithMenusByDate(restaurants, date).subscribe({
            next: (restaurantsWithMenus) => {
              const displayRestaurants = this.mapToDisplayRestaurants(restaurantsWithMenus);
              this.restaurants.set(displayRestaurants);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Erreur lors du chargement des menus:', error);
              this.isLoading.set(false);
            },
          });
        },
      });
    }, 500);
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Animation loaded!', animationItem);
  }

  increaseQuantity(restaurantId: number, itemId: number): void {
    const currentRestaurants = this.restaurants();
    const updatedRestaurants = currentRestaurants.map((restaurant) => {
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
    this.restaurants.set(updatedRestaurants);
  }

  decreaseQuantity(restaurantId: number, itemId: number): void {
    const currentRestaurants = this.restaurants();
    const updatedRestaurants = currentRestaurants.map((restaurant) => {
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
    this.restaurants.set(updatedRestaurants);
  }

  getRestaurantItemCount(restaurantId: number): number {
    const restaurant = this.restaurants().find((r) => r.id === restaurantId);
    return restaurant ? restaurant.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }

  /**
   * Ajoute les items sélectionnés au panier (version mise à jour sans vérification du solde)
   */
  addToCart(restaurantId: number): void {
    const restaurant = this.restaurants().find((r) => r.id === restaurantId);
    if (!restaurant) return;

    const itemsToAdd = restaurant.items.filter((item) => item.quantity > 0);

    if (itemsToAdd.length === 0) {
      this.notificationService.warning(
        'Sélection vide',
        "Veuillez sélectionner au moins un plat avant d'ajouter au panier"
      );
      return;
    }

    // Plus de vérification du solde - on peut commander même à crédit
    let addedCount = 0;
    let hasError = false;

    itemsToAdd.forEach((item) => {
      this.cartService
        .addToCart({
          mealId: item.id!,
          restaurantId: restaurantId,
          quantity: item.quantity,
        })
        .subscribe({
          next: (cart) => {
            addedCount++;

            if (addedCount === itemsToAdd.length && !hasError) {
              console.log(`✅ ${addedCount} article(s) ajouté(s) au panier`);

              this.notificationService.success(
                'Ajouté au panier',
                `${addedCount} article(s) ajouté(s) avec succès à votre panier`
              );

              this.resetRestaurantQuantities(restaurantId);
              this.cartService.loadCart();
            }
          },
          error: (error) => {
            hasError = true;
            console.error("❌ Erreur lors de l'ajout au panier:", error);

            let title = "Erreur d'ajout";
            let message = "Impossible d'ajouter l'article au panier";

            if (error.status === 400) {
              if (error.error?.includes('restaurant')) {
                title = 'Restaurant différent';
                message =
                  "Vous ne pouvez commander que dans un seul restaurant à la fois. Veuillez vider votre panier d'abord.";
              } else {
                message = error.error || "Erreur lors de l'ajout au panier";
              }
            } else if (error.status === 404) {
              title = 'Introuvable';
              message = "Le plat ou le restaurant n'a pas été trouvé";
            }

            this.notificationService.error(title, message);
          },
        });
    });
  }

  /**
   * Réinitialise les quantités d'un restaurant
   */
  resetRestaurantQuantities(restaurantId: number): void {
    const currentRestaurants = this.restaurants();
    const updatedRestaurants = currentRestaurants.map((restaurant) => {
      if (restaurant.id === restaurantId) {
        return {
          ...restaurant,
          items: restaurant.items.map((item) => ({ ...item, quantity: 0 })),
        };
      }
      return restaurant;
    });
    this.restaurants.set(updatedRestaurants);
  }
}
