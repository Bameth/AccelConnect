import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RestaurantService } from '../services/impl/restaurant.service';
import { Restaurant } from '../model/restaurant.model';
import { AdminOrderService } from '../services/impl/admin.order.service';
import { AdminOrder, OrderFilters, TodayOrderStats } from '../model/adminOrder.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css',
})
export class AdminComponent implements OnInit {
  private readonly orderService = inject(AdminOrderService);
  private readonly restaurantService = inject(RestaurantService);

  // Données
  allOrders: AdminOrder[] = [];
  displayedOrders: AdminOrder[] = [];
  restaurants: Restaurant[] = [];
  stats: TodayOrderStats | null = null;

  // État de chargement
  loading = false;
  loadingStats = false;

  // Filtres
  filters: OrderFilters = {
    status: 'ALL',
    searchTerm: '',
  };

  selectedDate: string = new Date().toISOString().split('T')[0];
  viewMode: 'day' | 'month' = 'day';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Options
  pageSizeOptions = [10, 20, 50, 100];
  months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  years: number[] = [];

  ngOnInit(): void {
    this.initYears();
    this.loadRestaurants();
    this.loadTodayStats();
    this.loadOrders();
  }

  initYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 2; i--) {
      this.years.push(i);
    }
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
      },
      error: (err) => console.error('Erreur chargement restaurants:', err),
    });
  }

  loadTodayStats(): void {
    this.loadingStats = true;
    this.orderService.getTodayStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
        this.loadingStats = false;
      },
    });
  }

  loadOrders(): void {
    this.loading = true;

    if (this.viewMode === 'day') {
      // Charger les commandes du jour sélectionné
      this.orderService.getOrdersByDate(this.selectedDate).subscribe({
        next: (orders) => {
          this.allOrders = orders;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement commandes:', err);
          this.loading = false;
        },
      });
    } else {
      // Charger toutes les commandes et filtrer par mois
      this.orderService.getAllOrders().subscribe({
        next: (orders) => {
          this.allOrders = orders;
          this.filters.month = this.selectedMonth.toString();
          this.filters.year = this.selectedYear.toString();
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement commandes:', err);
          this.loading = false;
        },
      });
    }
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onMonthChange(): void {
    this.currentPage = 1;
    this.filters.month = this.selectedMonth.toString();
    this.filters.year = this.selectedYear.toString();
    this.applyFilters();
  }

  onViewModeChange(mode: 'day' | 'month'): void {
    this.viewMode = mode;
    this.currentPage = 1;

    if (mode === 'day') {
      delete this.filters.month;
      delete this.filters.year;
    } else {
      this.filters.month = this.selectedMonth.toString();
      this.filters.year = this.selectedYear.toString();
    }

    this.loadOrders();
  }

  applyFilters(): void {
    let filtered = this.orderService.filterOrders(this.allOrders, this.filters);

    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.totalPages = Math.ceil(filtered.length / this.pageSize);

    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = filtered.slice(start, end);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  exportOrders(): void {
    const ordersToExport = this.orderService.filterOrders(this.allOrders, this.filters);
    this.orderService.exportToCSV(ordersToExport);
  }

  getStatusColor(status: 'CONFIRMED' | 'CANCELLED'): string {
    return this.orderService.getStatusColor(status);
  }

  getStatusLabel(status: 'CONFIRMED' | 'CANCELLED'): string {
    return this.orderService.getStatusLabel(status);
  }

  getRestaurantColor(restaurantName: string): string {
    const colors: Record<string, string> = {
      JOLOF: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
      RODRA: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      'CHEZ EVA': 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    };
    return colors[restaurantName] || 'bg-gray-50 text-gray-600';
  }

  get filteredStats() {
    if (!this.allOrders.length) return null;
    return this.orderService.calculateTotals(
      this.orderService.filterOrders(this.allOrders, this.filters)
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
