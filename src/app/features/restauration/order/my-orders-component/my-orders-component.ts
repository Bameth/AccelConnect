import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { Order, OrderStatus, ORDER_FILTERS, OrderFilterValue } from '../../model/order.model';
import { OrderService } from '../../services/impl/order.service';
import { ConfirmationService } from '../../../../core/services/impl/ConfirmationDialog.service';
import { NotificationService } from '../../../../core/services/impl/notification.service';

interface MonthOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, LottieComponent],
  templateUrl: './my-orders-component.html',
  styleUrl: './my-orders-component.css',
})
export class MyOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<OrderFilterValue>('all');
  selectedMonth = signal<string>(this.getCurrentMonth());
  expandedOrderId = signal<number | null>(null);

  // Statistiques
  totalOrders = signal(0);
  totalSpent = signal(0);
  confirmedCount = signal(0);

  // Mois disponibles (12 derniers mois)
  availableMonths = signal<MonthOption[]>([]);

  // Animation Lottie pour état vide
  emptyOrdersOptions: AnimationOptions = {
    path: '/assets/lottie/empty-orders.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Filtres disponibles
  filters = ORDER_FILTERS.map((filter) => ({
    ...filter,
    count: 0,
  }));

  ngOnInit(): void {
    this.generateAvailableMonths();
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }

  /**
   * Génère la liste des 12 derniers mois
   */
  generateAvailableMonths(): void {
    const months: MonthOption[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      });
      months.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      });
    }

    this.availableMonths.set(months);
  }

  /**
   * Retourne le mois actuel au format YYYY-MM
   */
  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Charge toutes les commandes de l'utilisateur
   */
  loadOrders(): void {
    this.isLoading.set(true);

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.applyFilters();
        this.isLoading.set(false);
        console.log('📦 Commandes chargées:', orders);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        if (error.status !== 401) {
          this.notificationService.error(
            'Erreur de chargement',
            'Impossible de charger vos commandes. Veuillez réessayer.'
          );
        }
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Applique tous les filtres (mois + statut)
   */
  applyFilters(): void {
    let filtered = this.orders();

    // Filtre par mois
    const selectedMonth = this.selectedMonth();
    filtered = filtered.filter((order) => {
      const orderMonth = order.createdAt.substring(0, 7); // YYYY-MM
      return orderMonth === selectedMonth;
    });

    // Filtre par statut
    const statusFilter = this.selectedFilter();
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    this.filteredOrders.set(filtered);
    this.calculateStatistics(filtered);
    this.updateFilterCounts();
  }

  /**
   * Calcule les statistiques pour les commandes filtrées
   */
  calculateStatistics(orders: Order[]): void {
    this.totalOrders.set(orders.length);
    this.totalSpent.set(
      orders
        .filter((o) => o.status === OrderStatus.CONFIRMED)
        .reduce((sum, o) => sum + o.totalAmount, 0)
    );
    this.confirmedCount.set(orders.filter((o) => o.status === OrderStatus.CONFIRMED).length);
  }

  /**
   * Met à jour le compteur de chaque filtre
   */
  updateFilterCounts(): void {
    const allOrders = this.orders();
    const selectedMonth = this.selectedMonth();

    // Filtrer par mois d'abord
    const ordersInMonth = allOrders.filter((order) => {
      const orderMonth = order.createdAt.substring(0, 7);
      return orderMonth === selectedMonth;
    });

    this.filters = ORDER_FILTERS.map((filter) => ({
      ...filter,
      count:
        filter.value === 'all'
          ? ordersInMonth.length
          : ordersInMonth.filter((o) => o.status === filter.value).length,
    }));
  }

  /**
   * Change le mois sélectionné
   */
  selectMonth(month: string): void {
    this.selectedMonth.set(month);
    this.applyFilters();
  }

  /**
   * Applique un filtre de statut
   */
  applyFilter(filter: OrderFilterValue): void {
    this.selectedFilter.set(filter);
    this.applyFilters();
  }

  /**
   * Expand/Collapse une commande
   */
  toggleOrderDetails(orderId: number): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  /**
   * Annule une commande
   */
  cancelOrder(orderId: number, event: Event): void {
    event.stopPropagation();

    this.confirmationService.confirmDelete(
      'Annuler cette commande ?',
      'Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.',
      () => {
        this.orderService.cancelOrder(orderId).subscribe({
          next: (updatedOrder) => {
            const currentOrders = this.orders();
            const index = currentOrders.findIndex((o) => o.id === orderId);
            if (index !== -1) {
              currentOrders[index] = updatedOrder;
              this.orders.set([...currentOrders]);
              this.applyFilters();
            }
            this.notificationService.success(
              'Commande annulée',
              'Votre commande a été annulée avec succès. Votre wallet a été remboursé.'
            );
            console.log('✅ Commande annulée:', updatedOrder);
          },
          error: (error) => {
            console.error("❌ Erreur lors de l'annulation:", error);
            this.notificationService.error(
              "Erreur d'annulation",
              "Impossible d'annuler la commande. Veuillez réessayer."
            );
          },
        });
      }
    );
  }

  /**
   * Obtient le label du statut
   */
  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  /**
   * Obtient la couleur du statut
   */
  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'from-green-500 to-emerald-600',
      [OrderStatus.CANCELLED]: 'from-red-500 to-red-600',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  }

  /**
   * Obtient l'icône du statut
   */
  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'check-circle',
      [OrderStatus.CANCELLED]: 'times-circle',
    };
    return icons[status] || 'circle';
  }

  /**
   * Vérifie si une commande peut être annulée
   * Note: Seules les commandes confirmées peuvent être annulées
   */
  canCancel(order: Order): boolean {
    return order.status === OrderStatus.CONFIRMED;
  }

  /**
   * Formate un montant
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Gestion animation Lottie
   */
  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Empty orders animation loaded!', animationItem);
  }
}
