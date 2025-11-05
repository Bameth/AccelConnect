import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { DepositRequest, Transaction, UserWalletStats } from '../../model/adminWallet.model';

@Injectable({
  providedIn: 'root',
})
export class AdminWalletService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/wallet`;

  /**
   * Récupère les statistiques de tous les utilisateurs
   */
  getAllUserStats(): Observable<UserWalletStats[]> {
    return this.http.get<UserWalletStats[]>(`${this.apiUrl}/admin/stats`);
  }

  /**
   * Effectue un dépôt pour un utilisateur
   */
  depositToUser(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/deposit`, request);
  }

  /**
   * Formate un montant
   */
  formatAmount(amount: number): string {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  }

  /**
   * Obtient la couleur du statut
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Actif':
        return 'text-green-600 bg-green-50';
      case 'Solde faible':
        return 'text-orange-600 bg-orange-50';
      case 'Solde épuisé':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }
}
