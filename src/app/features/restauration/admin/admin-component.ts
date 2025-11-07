import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminDashboardService } from '../services/impl/admin.dashboard.service';
import {
  DashboardFilters,
  DashboardView,
  RestaurantStats,
  UserOrderSummary,
} from '../model/adminOrder.model';

interface MealStat {
  mealName: string;
  quantity: number;
  totalAmount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './admin-component.html',
  styleUrls: ['./admin-component.css'],
})
export class AdminComponent implements OnInit {
  private readonly dashboardService = inject(AdminDashboardService);

  // États
  isLoading = signal(true);
  dashboardData = signal<DashboardView | null>(null);

  // Filtres
  filters = signal<DashboardFilters>({
    selectedDate: new Date().toISOString().split('T')[0],
    selectedRestaurantId: null,
    searchTerm: '',
    showCancelled: false,
  });

  // Modal statistiques restaurant
  showStatsModal = signal(false);
  selectedRestaurantStats = signal<{
    restaurant: RestaurantStats;
    meals: MealStat[];
  } | null>(null);

  // Computed: Restaurants filtrés
  filteredRestaurants = computed(() => {
    const data = this.dashboardData();
    if (!data) return [];
    return data.restaurantStats;
  });

  // Computed: Utilisateurs filtrés - CORRIGÉ
  filteredUsers = computed(() => {
    const data = this.dashboardData();
    const f = this.filters();
    if (!data) return [];

    let users = data.userOrders;

    // Filtre par restaurant
    if (f.selectedRestaurantId) {
      users = users.filter((u) =>
        u.meals.some((m) => {
          const restaurant = data.restaurantStats.find((r) => r.restaurantName === m.restaurant);
          return restaurant?.restaurantId === f.selectedRestaurantId;
        })
      );
    }

    // Filtre par recherche
    if (f.searchTerm) {
      const term = f.searchTerm.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.meals.some((m) => m.name.toLowerCase().includes(term)) ||
          u.restaurants.some((r) => r.toLowerCase().includes(term))
      );
    }

    // ✅ CORRECTION: Filtre commandes annulées
    if (!f.showCancelled) {
      users = users.filter((u) => u.orders.some((o) => o.status === 'CONFIRMED'));
    }

    return users;
  });

  ngOnInit(): void {
    // ✅ CORRECTION: Attendre un peu avant de charger pour que Keycloak soit initialisé
    setTimeout(() => {
      this.loadData();
    }, 500);
  }

  /**
   * 📊 Charge les données
   */
  loadData(): void {
    this.isLoading.set(true);
    const date = this.filters().selectedDate;

    this.dashboardService.loadDashboardData(date).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
        console.log('📊 Dashboard chargé:', data);
      },
      error: (error) => {
        console.error('❌ Erreur chargement:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * 📅 Change la date
   */
  onDateChange(newDate: string): void {
    this.filters.update((f) => ({ ...f, selectedDate: newDate }));
    this.loadData();
  }

  /**
   * 🏪 Sélectionne un restaurant
   */
  selectRestaurant(restaurantId: number | null): void {
    this.filters.update((f) => ({ ...f, selectedRestaurantId: restaurantId }));
  }

  /**
   * 🔍 Recherche
   */
  onSearch(term: string): void {
    this.filters.update((f) => ({ ...f, searchTerm: term }));
  }

  /**
   * ✅ CORRECTION: Toggle annulées
   */
  updateShowCancelled(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filters.update((f) => ({ ...f, showCancelled: checked }));
  }

  /**
   * 📊 Ouvre le modal de statistiques d'un restaurant
   */
  openRestaurantStats(restaurant: RestaurantStats): void {
    const data = this.dashboardData();
    if (!data) return;

    // Calculer les statistiques des plats pour ce restaurant
    const mealStatsMap = new Map<string, MealStat>();

    data.userOrders.forEach((user) => {
      user.orders
        .filter((order) => order.status === 'CONFIRMED')
        .forEach((order) => {
          order.items
            .filter((item) => item.restaurantId === restaurant.restaurantId)
            .forEach((item) => {
              const existing = mealStatsMap.get(item.mealName) || {
                mealName: item.mealName,
                quantity: 0,
                totalAmount: 0,
              };

              existing.quantity += item.quantity;
              existing.totalAmount += item.subtotal;

              mealStatsMap.set(item.mealName, existing);
            });
        });
    });

    const meals = Array.from(mealStatsMap.values()).sort((a, b) => b.quantity - a.quantity);

    this.selectedRestaurantStats.set({ restaurant, meals });
    this.showStatsModal.set(true);
  }

  /**
   * ❌ Ferme le modal
   */
  closeStatsModal(): void {
    this.showStatsModal.set(false);
    this.selectedRestaurantStats.set(null);
  }

  /**
   * 📥 Exporte les données d'un restaurant
   */
  exportRestaurant(restaurant: RestaurantStats): void {
    const data = this.dashboardData();
    if (!data) return;

    const orders = data.userOrders.flatMap((u) => u.orders);
    const restaurantOrders = orders.filter((o) =>
      o.items.some((item) => item.restaurantId === restaurant.restaurantId)
    );

    this.dashboardService.exportRestaurantCSV(
      restaurant.restaurantName,
      restaurantOrders,
      data.date
    );
  }

  /**
   * 💱 Formate un montant
   */
  formatAmount(amount: number): string {
    return this.dashboardService.formatAmount(amount);
  }

  /**
   * 📅 Formate une date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * 🎨 Couleur du solde
   */
  getBalanceColor(balance: number): string {
    if (balance < 0) return 'text-[#E84141]';
    if (balance > 0) return 'text-[#99CFBD]';
    return 'text-[#303131]';
  }
}
