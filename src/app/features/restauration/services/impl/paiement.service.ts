import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import {
  PaymentSummary,
  PaymentValidationRequest,
  PaymentValidationResponse,
} from '../../model/paiement.model';

interface PaymentValidationState {
  canValidate: boolean;
  isFriday: boolean;
  currentDay: string;
  weekStartDate: string;
  weekEndDate: string;
  message: string;
  nextFriday?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/payments`;

  /**
   * ✅ Vérifie si on peut valider les paiements (vendredi uniquement)
   */
  checkCanValidatePayments(): Observable<PaymentValidationState> {
    return this.http.get<PaymentValidationState>(`${this.apiUrl}/can-validate`);
  }

  /**
   * 📊 Récupère le récapitulatif de paiement de la semaine en cours
   * ⚠️ Ne fonctionne que le vendredi
   */
  getPaymentSummary(startDate: string, endDate: string): Observable<PaymentSummary> {
    // Note: Le backend ignore ces paramètres et utilise toujours la semaine en cours
    return this.http.get<PaymentSummary>(`${this.apiUrl}/summary`);
  }

  /**
   * ✅ Valide et enregistre le paiement
   * 🚚 Calcule automatiquement les frais de livraison
   * ⚠️ Ne fonctionne que le vendredi
   */
  validatePayment(request: PaymentValidationRequest): Observable<PaymentValidationResponse> {
    return this.http.post<PaymentValidationResponse>(`${this.apiUrl}/validate`, request);
  }

  /**
   * 📅 Récupère la date du dernier paiement
   */
  getLastPaymentDate(): Observable<{ lastPaymentDate: string | null }> {
    return this.http.get<{ lastPaymentDate: string | null }>(`${this.apiUrl}/last-payment-date`);
  }

  /**
   * 💱 Formate un montant
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
