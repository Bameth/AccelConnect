import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { OrderStatus, ORDER_FILTERS, OrderFilterValue, OrderDTO } from '../../model/order.model';
import { OrderService } from '../../services/impl/order.service';
import { CartService } from '../../services/impl/cart.service';
import { ConfirmationService } from '../../../../core/services/impl/ConfirmationDialog.service';
import { NotificationService } from '../../../../core/services/impl/notification.service';
import { UniquePipe } from '../../../../shared/pipes/unique.pipe';

interface MonthOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, LottieComponent, UniquePipe],
  templateUrl: './my-orders-component.html',
  styleUrl: './my-orders-component.css',
})
export class MyOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  orders = signal<OrderDTO[]>([]);
  filteredOrders = signal<OrderDTO[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<OrderFilterValue>('all');
  selectedMonth = signal<string>(this.getCurrentMonth());
  expandedOrderId = signal<number | null>(null);

  totalOrders = signal(0);
  totalSpent = signal(0);
  confirmedCount = signal(0);
  cancelOrderCount = signal(0);
  availableMonths = signal<MonthOption[]>([]);

  // Constante pour l'heure limite (12h)
  private readonly MODIFICATION_DEADLINE_HOUR = 12;

  emptyOrdersOptions: AnimationOptions = {
    path: 'assets/lottie/empty-orders.json',
    loop: true,
    autoplay: true,
  };

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

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  loadOrders(): void {
    this.isLoading.set(true);

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        const normalizedOrders = orders.map((order) => ({
          ...order,
          restaurantName:
            order.restaurantName ||
            (order.items.length > 0 ? order.items[0].restaurantName : 'Restaurant inconnu'),
        }));

        this.orders.set(normalizedOrders);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur chargement commandes:', error);
        if (error.status !== 401) {
          this.notificationService.error(
            'Erreur de chargement',
            'Impossible de charger vos commandes.'
          );
        }
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    let filtered = this.orders();
    const selectedMonth = this.selectedMonth();

    filtered = filtered.filter((order) => {
      const orderMonth = order.createdAt.substring(0, 7);
      return orderMonth === selectedMonth;
    });

    const statusFilter = this.selectedFilter();
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    this.filteredOrders.set(filtered);
    this.calculateStatistics(filtered);
    this.updateFilterCounts();
  }

  calculateStatistics(orders: OrderDTO[]): void {
    this.totalOrders.set(orders.length);
    this.totalSpent.set(
      orders
        .filter((o) => o.status === OrderStatus.CONFIRMED)
        .reduce((sum, o) => sum + o.totalAmount, 0)
    );
    this.confirmedCount.set(orders.filter((o) => o.status === OrderStatus.CONFIRMED).length);
    this.cancelOrderCount.set(orders.filter((o) => o.status === OrderStatus.CANCELLED).length);
  }

  updateFilterCounts(): void {
    const allOrders = this.orders();
    const selectedMonth = this.selectedMonth();

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

  selectMonth(month: string): void {
    this.selectedMonth.set(month);
    this.applyFilters();
  }

  applyFilter(filter: OrderFilterValue): void {
    this.selectedFilter.set(filter);
    this.applyFilters();
  }

  toggleOrderDetails(orderId: number): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  /**
   * ⏰ Vérifie si on est avant 12h aujourd'hui
   */
  isBeforeDeadline(): boolean {
    const now = new Date();
    return now.getHours() < this.MODIFICATION_DEADLINE_HOUR;
  }

  /**
   * 🔄 Modifier une commande du jour
   */
  modifyOrder(order: OrderDTO, event: Event): void {
    event.stopPropagation();

    const today = new Date().toISOString().split('T')[0];
    const orderDate = order.orderDate;

    if (orderDate !== today) {
      this.notificationService.warning(
        'Modification impossible',
        'Vous ne pouvez modifier que la commande du jour.'
      );
      return;
    }

    if (!this.isBeforeDeadline()) {
      this.notificationService.warning(
        'Délai dépassé',
        `Il est trop tard pour modifier votre commande (après ${this.MODIFICATION_DEADLINE_HOUR}h).`
      );
      return;
    }

    this.confirmationService.confirm({
      title: '🔄 Modifier votre commande',
      message: `Vous allez modifier votre commande du jour. Les articles actuels seront remplacés par votre nouveau panier.`,
      type: 'info',
      confirmText: 'Modifier',
      cancelText: 'Annuler',
      onConfirm: () => {
        // Vider le panier actuel
        this.cartService.clear();

        // Ajouter les items de la commande au panier
        order.items.forEach((item) => {
          this.cartService.addItem({
            mealId: item.mealId,
            mealName: item.mealName,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          });
        });

        this.notificationService.success(
          'Commande chargée',
          'Modifiez votre panier puis validez vos changements.'
        );

        this.router.navigate(['/restauration']);
      },
    });
  }

  /**
   * ❌ Annuler une commande
   */
  cancelOrder(orderId: number, event: Event): void {
    event.stopPropagation();

    if (!this.isBeforeDeadline()) {
      this.notificationService.warning(
        'Délai dépassé',
        `Il est trop tard pour annuler votre commande (après ${this.MODIFICATION_DEADLINE_HOUR}h).`
      );
      return;
    }

    this.confirmationService.confirmDelete(
      'Annuler cette commande ?',
      'Êtes-vous sûr ? Cette action est irréversible.',
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
            this.notificationService.success('Commande annulée', 'Votre wallet a été remboursé.');
          },
          error: (error) => {
            console.error('❌ Erreur annulation:', error);

            let message = "Impossible d'annuler la commande.";
            if (error.error?.includes('12h')) {
              message = `Il est trop tard pour annuler (après ${this.MODIFICATION_DEADLINE_HOUR}h).`;
            }

            this.notificationService.error("Erreur d'annulation", message);
          },
        });
      }
    );
  }

  /**
   * 📅 Vérifie si la commande est du jour
   */
  isTodayOrder(order: OrderDTO): boolean {
    const today = new Date().toISOString().split('T')[0];
    return order.orderDate === today;
  }

  /**
   * ✅ Peut modifier (commande confirmée du jour ET avant 12h)
   */
  canModify(order: OrderDTO): boolean {
    return (
      order.status === OrderStatus.CONFIRMED && this.isTodayOrder(order) && this.isBeforeDeadline()
    );
  }

  /**
   * ❌ Peut annuler (commande confirmée ET avant 12h)
   */
  canCancel(order: OrderDTO): boolean {
    return order.status === OrderStatus.CONFIRMED && this.isTodayOrder(order) && this.isBeforeDeadline();
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'from-green-500 to-emerald-600',
      [OrderStatus.CANCELLED]: 'from-red-500 to-red-600',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  }

  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'check-circle',
      [OrderStatus.CANCELLED]: 'times-circle',
    };
    return icons[status] || 'circle';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Animation loaded!', animationItem);
  }
}
