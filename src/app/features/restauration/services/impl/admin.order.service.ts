import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import {
  AdminOrder,
  OrderFilters,
  RestaurantOrderStats,
  TodayOrderStats,
} from '../../model/adminOrder.model';

@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/orders`;

  /**
   * Récupère toutes les commandes avec filtres optionnels
   */
  getAllOrders(filters?: OrderFilters): Observable<AdminOrder[]> {
    let params = new HttpParams();

    if (filters?.date) {
      params = params.set('date', filters.date);
    }

    return this.http.get<AdminOrder[]>(this.apiUrl, { params });
  }

  /**
   * Récupère les commandes par date
   */
  getOrdersByDate(date: string): Observable<AdminOrder[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/by-date`, { params });
  }

  /**
   * Récupère les commandes par restaurant
   */
  getOrdersByRestaurant(restaurantId: number): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/by-restaurant/${restaurantId}`);
  }

  /**
   * Récupère les statistiques du jour
   */
  getTodayStats(): Observable<TodayOrderStats> {
    return this.http.get<TodayOrderStats>(`${this.apiUrl}/today-stats`);
  }

  /**
   * Récupère les statistiques par restaurant pour une date
   */
  getRestaurantStats(date: string): Observable<RestaurantOrderStats[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<RestaurantOrderStats[]>(`${this.apiUrl}/restaurant-stats`, { params });
  }

  /**
   * Filtre les commandes localement
   */
  filterOrders(orders: AdminOrder[], filters: OrderFilters): AdminOrder[] {
    let filtered = [...orders];

    // Filtre par restaurant
    if (filters.restaurantId) {
      filtered = filtered.filter((o) => o.restaurantId === filters.restaurantId);
    }

    // Filtre par statut
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter((o) => o.status === filters.status);
    }

    // Filtre par recherche (nom utilisateur ou restaurant)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.username.toLowerCase().includes(term) || o.restaurantName.toLowerCase().includes(term)
      );
    }

    // Filtre par mois
    if (filters.month && filters.year) {
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.orderDate);
        return (
          orderDate.getMonth() + 1 === Number.parseInt(filters.month!) &&
          orderDate.getFullYear() === Number.parseInt(filters.year!)
        );
      });
    }

    return filtered;
  }

  /**
   * Obtient la couleur du statut
   */
  getStatusColor(status: 'CONFIRMED' | 'CANCELLED'): string {
    return status === 'CONFIRMED'
      ? 'bg-green-50 text-green-700 ring-green-600/20'
      : 'bg-red-50 text-red-700 ring-red-600/20';
  }

  /**
   * Obtient le label du statut en français
   */
  getStatusLabel(status: 'CONFIRMED' | 'CANCELLED'): string {
    return status === 'CONFIRMED' ? 'Confirmée' : 'Annulée';
  }

  /**
   * Calcule les totaux
   */
  calculateTotals(orders: AdminOrder[]): {
    totalOrders: number;
    totalAmount: number;
    confirmedCount: number;
    cancelledCount: number;
  } {
    return {
      totalOrders: orders.length,
      totalAmount: orders
        .filter((o) => o.status === 'CONFIRMED')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      confirmedCount: orders.filter((o) => o.status === 'CONFIRMED').length,
      cancelledCount: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }

  /**
   * Exporte les commandes en CSV
   */
  exportToCSV(orders: AdminOrder[]): void {
    const headers = [
      'ID',
      'Date',
      'Utilisateur',
      'Restaurant',
      'Articles',
      'Sous-total',
      'Frais livraison',
      'Total',
      'Statut',
    ];

    const rows = orders.map((order) => [
      order.id,
      new Date(order.orderDate).toLocaleDateString('fr-FR'),
      order.username,
      order.restaurantName,
      order.items.map((i) => `${i.mealName} (x${i.quantity})`).join('; '),
      order.subtotal,
      order.deliveryFeeShare,
      order.totalAmount,
      this.getStatusLabel(order.status),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
