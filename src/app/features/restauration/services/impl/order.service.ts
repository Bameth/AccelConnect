import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { OrderCreationPayload } from './cart.service';
import { OrderDTO } from '../../model/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  /**
   * 🛒 Crée une commande
   */
  createOrder(payload: OrderCreationPayload): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(this.apiUrl, payload);
  }

  /**
   * 📋 Récupère les commandes de l'utilisateur
   */
  getMyOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  /**
   * ❌ Annule une commande
   */
  cancelOrder(orderId: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  /**
   * 🎨 Obtient la couleur du statut
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      CONFIRMED: 'from-green-500 to-emerald-600',
      CANCELLED: 'from-red-500 to-red-600',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  }

  /**
   * 📝 Obtient le label du statut
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  }

  /**
   * 🎯 Obtient l'icône du statut
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      CONFIRMED: 'check-circle',
      CANCELLED: 'times-circle',
    };
    return icons[status] || 'circle';
  }
}
