import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { AddToCartRequest, Cart, UpdateCartItemRequest } from '../../model/panier.model';

@Injectable({
  providedIn: 'root',
})
export class CartServiceImpl {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  // Signal réactif pour le panier
  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  // Signal pour le nombre d'items
  cartItemCount = signal(0);

  constructor() {
    this.loadCart();
  }

  /**
   * Charge le panier de l'utilisateur
   */
  loadCart(): void {
    this.http.get<Cart>(this.apiUrl).subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
        this.cartItemCount.set(cart.totalItems);
        console.log('🛒 Panier chargé:', cart);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du panier:', error);
      },
    });
  }

  /**
   * Récupère le panier actuel
   */
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap((cart) => {
        this.cartSubject.next(cart);
        this.cartItemCount.set(cart.totalItems);
      })
    );
  }

  /**
   * Ajoute un plat au panier
   */
  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/add`, request).pipe(
      tap((cart) => {
        this.cartSubject.next(cart);
        this.cartItemCount.set(cart.totalItems);
        console.log('✅ Plat ajouté au panier:', cart);
      })
    );
  }

  /**
   * Met à jour la quantité d'un item
   */
  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    const request: UpdateCartItemRequest = { quantity };
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, request).pipe(
      tap((cart) => {
        this.cartSubject.next(cart);
        this.cartItemCount.set(cart.totalItems);
      })
    );
  }

  /**
   * Supprime un item du panier
   */
  removeFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap((cart) => {
        this.cartSubject.next(cart);
        this.cartItemCount.set(cart.totalItems);
        console.log('❌ Item supprimé du panier');
      })
    );
  }

  /**
   * Vide le panier
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.cartItemCount.set(0);
        console.log('🗑️ Panier vidé');
      })
    );
  }

  /**
   * Obtient le panier actuel depuis le BehaviorSubject
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }
}
