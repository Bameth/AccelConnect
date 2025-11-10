import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminDashboardService } from '../services/impl/admin.dashboard.service';
import { DashboardFilters, DashboardView, RestaurantStats } from '../model/adminOrder.model';
import { PaymentSummary } from '../model/paiement.model';
import { PaiementService } from '../services/impl/paiement.service';
import { NotificationService } from '../../../core/services/impl/notification.service';

interface MealStat {
  mealName: string;
  quantity: number;
  totalAmount: number;
}

interface PaymentValidationState {
  canValidate: boolean;
  isFriday: boolean;
  currentDay: string;
  weekStartDate: string;
  weekEndDate: string;
  message: string;
  nextFriday?: string;
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
  private readonly paymentService = inject(PaiementService);
  private readonly notificationService = inject(NotificationService);

  // États
  isLoading = signal(true);
  dashboardData = signal<DashboardView | null>(null);

  // États de validation des paiements
  paymentValidationState = signal<PaymentValidationState | null>(null);
  canValidatePayments = computed(() => this.paymentValidationState()?.canValidate ?? false);

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

  // Modal paiement
  showPaymentModal = signal(false);
  paymentSummary = signal<PaymentSummary | null>(null);
  isLoadingPayment = signal(false);
  lastPaymentDate = signal<string | null>(null);

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
    setTimeout(() => {
      this.loadData();
      this.loadLastPaymentDate();
      this.checkPaymentValidationState();
    }, 500);
  }

  /**
   * ✅ Vérifie si on peut valider les paiements (vendredi uniquement)
   */
  checkPaymentValidationState(): void {
    this.paymentService.checkCanValidatePayments().subscribe({
      next: (state) => {
        this.paymentValidationState.set(state);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du jour', error);
      },
    });
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
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.error(
          'Erreur de chargement',
          'Impossible de charger les données du dashboard: ' +
            (error.error?.message || error.message)
        );
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
   * ✅ Toggle annulées
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
   * ❌ Ferme le modal statistiques
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

    this.notificationService.success(
      'Export réussi',
      `Les données du restaurant "${restaurant.restaurantName}" ont été exportées`
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

  /**
   * 📅 Charge la date du dernier paiement
   */
  loadLastPaymentDate(): void {
    this.paymentService.getLastPaymentDate().subscribe({
      next: (response) => {
        this.lastPaymentDate.set(response.lastPaymentDate);
      },
      error: (error) => {
        console.error('Erreur chargement dernière date paiement', error);
      },
    });
  }

  /**
   * 💰 Ouvre le modal de paiement (uniquement si vendredi)
   */
  openPaymentModal(): void {
    const validationState = this.paymentValidationState();

    if (!validationState?.canValidate) {
      this.notificationService.warning(
        '⚠️ Validation impossible',
        validationState?.message || 'La validation ne peut être effectuée que le vendredi',
        7000
      );
      return;
    }

    this.isLoadingPayment.set(true);
    this.showPaymentModal.set(true);

    // Utiliser les dates de la semaine en cours (fournies par le backend)
    const startDate = validationState.weekStartDate;
    const endDate = validationState.weekEndDate;

    this.paymentService.getPaymentSummary(startDate, endDate).subscribe({
      next: (summary) => {
        this.paymentSummary.set(summary);
        this.isLoadingPayment.set(false);

        if (summary.restaurants.length === 0) {
          this.notificationService.warning(
            'Aucune donnée',
            'Aucune commande confirmée trouvée pour cette semaine'
          );
        } else {
          this.notificationService.success(
            'Récapitulatif chargé',
            `Semaine du ${this.formatDate(summary.startDate)} au ${this.formatDate(
              summary.endDate
            )} • ` +
              `${summary.restaurants.length} restaurant(s) • ${summary.globalStats.totalOrders} commande(s)`,
            8000
          );
        }
      },
      error: (error) => {
        this.isLoadingPayment.set(false);
        this.showPaymentModal.set(false);
        this.notificationService.error(
          'Erreur de chargement',
          error.error?.message || 'Impossible de charger le récapitulatif de paiement',
          7000
        );
      },
    });
  }

  /**
   * ✅ Valide et enregistre le paiement
   */
  validatePayment(): void {
    const summary = this.paymentSummary();
    if (!summary) return;

    const confirmMessage =
      '⚠️ CONFIRMATION REQUISE\n\n' +
      'Voulez-vous vraiment valider ce paiement ?\n\n' +
      `📅 Semaine: ${this.formatDate(summary.startDate)} → ${this.formatDate(summary.endDate)}\n` +
      `🏪 ${summary.restaurants.length} restaurant(s)\n` +
      `💰 ${this.formatAmount(summary.globalStats.totalAmountWithoutSubsidy)} FCFA à payer\n` +
      `🚚 ${this.formatAmount(summary.globalStats.totalDeliveryFees)} FCFA frais de livraison\n` +
      `📦 ${summary.globalStats.totalOrders} commande(s)\n\n` +
      '⚠️ Les frais de livraison seront automatiquement calculés et débités\n' +
      '❌ Cette action est IRRÉVERSIBLE';

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoadingPayment.set(true);

    this.paymentService
      .validatePayment({
        startDate: summary.startDate,
        endDate: summary.endDate,
      })
      .subscribe({
        next: (response) => {
          this.notificationService.success(
            '✅ Paiement validé avec succès',
            `${response.affectedOrders} commande(s) traitée(s) • ` +
              `${response.affectedUsers} utilisateur(s) concerné(s) • ` +
              `Frais de livraison calculés et débités`,
            12000
          );

          this.closePaymentModal();
          this.loadData();
          this.loadLastPaymentDate();
          this.checkPaymentValidationState();
        },
        error: (error) => {
          this.isLoadingPayment.set(false);
          this.notificationService.error(
            'Échec de validation',
            error.error?.message || 'Impossible de valider le paiement',
            10000
          );
        },
      });
  }

  /**
   * ❌ Ferme le modal de paiement
   */
  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.paymentSummary.set(null);
    this.isLoadingPayment.set(false);
  }
}
