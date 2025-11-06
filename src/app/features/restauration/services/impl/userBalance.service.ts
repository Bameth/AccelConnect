import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { UserBalanceDTO, DepositRequest, UserBalanceStatsDTO } from '../../model/balance.model';

@Injectable({
  providedIn: 'root',
})
export class UserBalanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/balance`;

  /**
   * 📊 Récupère le solde de l'utilisateur connecté
   */
  getMyBalance(): Observable<UserBalanceDTO> {
    return this.http.get<UserBalanceDTO>(this.apiUrl);
  }

  /**
   * 💵 Effectue un dépôt (ADMIN uniquement)
   */
  deposit(request: DepositRequest): Observable<UserBalanceDTO> {
    return this.http.post<UserBalanceDTO>(`${this.apiUrl}/deposit`, request);
  }

  /**
   * 📋 Récupère les stats de tous les utilisateurs (ADMIN)
   */
  getAllUserStats(): Observable<UserBalanceStatsDTO[]> {
    return this.http.get<UserBalanceStatsDTO[]>(`${this.apiUrl}/admin/stats`);
  }

  /**
   * 🎨 Obtient la couleur du badge selon le statut
   */
  getBalanceColor(balance: number): string {
    if (balance < 0) return 'from-red-500 to-red-600';
    if (balance > 0) return 'from-green-500 to-green-600';
    return 'from-gray-500 to-gray-600';
  }

  /**
   * 📝 Obtient l'icône selon le statut
   */
  getBalanceIcon(balance: number): string {
    if (balance < 0) return 'exclamation-triangle';
    if (balance > 0) return 'check-circle';
    return 'equals';
  }

  /**
   * 📊 Formate un montant en FCFA
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}