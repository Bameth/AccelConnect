import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { CreateOrderRequest, Order, OrderStatus, OrderSummary } from '../../model/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  /**
   * Crée une commande à partir du panier
   */
  createOrder(request?: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request || {});
  }

  /**
   * Récupère toutes les commandes de l'utilisateur
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  /**
   * Récupère une commande spécifique
   */
  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Récupère le résumé de la commande avant validation
   */
  getOrderSummary(deliveryDate?: string): Observable<OrderSummary> {
    let params = new HttpParams();
    if (deliveryDate) {
      params = params.set('deliveryDate', deliveryDate);
    }
    return this.http.get<OrderSummary>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * Annule une commande
   */
  cancelOrder(orderId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  /**
   * Convertit le statut en texte français
   */
  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'Confirmée',
      [OrderStatus.CANCELLED]: 'Annulée',
    };
    return labels[status] || status;
  }

  /**
   * Obtient la couleur du statut pour l'affichage
   */
  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.CONFIRMED]: 'text-blue-600 bg-blue-50',
      [OrderStatus.CANCELLED]: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  }
}
