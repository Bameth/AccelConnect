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

  // Modal dépôt
  showDepositModal = signal(false);
  selectedUser = signal<UserOrderSummary | null>(null);
  depositAmount = signal<number | null>(null);
  isDepositing = signal(false);

  // Computed: Restaurants filtrés
  filteredRestaurants = computed(() => {
    const data = this.dashboardData();
    if (!data) return [];
    return data.restaurantStats;
  });

  // Computed: Utilisateurs filtrés
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

    // Filtre commandes annulées
    if (!f.showCancelled) {
      users = users.filter((u) => u.orders.some((o) => o.status === 'CONFIRMED'));
    }

    return users;
  });

  ngOnInit(): void {
    this.loadData();
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

  updateShowCancelled(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filters().showCancelled = checked;
    this.loadData();
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
    if (balance < 0) return 'text-red-600';
    if (balance > 0) return 'text-green-600';
    return 'text-gray-600';
  }
}
