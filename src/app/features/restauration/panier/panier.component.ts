import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { CartServiceImpl } from '../services/impl/cart.service';
import { OrderService } from '../services/impl/order.service';
import { OrderSummary } from '../model/order.model';
import { Cart, CartItem } from '../model/panier.model';
import { ConfirmationService } from '../../../core/services/impl/ConfirmationDialog.service';
import { NotificationService } from '../../../core/services/impl/notification.service';

@Component({
  selector: 'app-panier-component',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, LottieComponent],
  templateUrl: './panier-component.html',
  styleUrl: './panier-component.css',
})
export class PanierComponent implements OnInit {
  private readonly cartService = inject(CartServiceImpl);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);

  cart = signal<Cart | null>(null);
  orderSummary = signal<OrderSummary | null>(null);
  isLoading = signal(false);
  isOrdering = signal(false);
  isAnimating = signal(false);
  lottieLoaded = signal(false);

  // Constante pour la subvention
  private readonly SUBVENTION_AMOUNT = 1000;

  emptyCartOptions: AnimationOptions = {
    path: '/assets/lottie/emptycart.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  ngOnInit() {
    this.loadCart();
    setTimeout(() => this.lottieLoaded.set(true), 500);
  }

  loadCart(): void {
    this.isLoading.set(true);

    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.isLoading.set(false);

        if (cart.items.length > 0) {
          this.loadOrderSummary();
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du panier:', error);
        this.notificationService.error(
          'Erreur de chargement',
          'Impossible de charger votre panier. Veuillez réessayer.'
        );
        this.isLoading.set(false);
      },
    });
  }

  loadOrderSummary(): void {
    this.orderService.getOrderSummary().subscribe({
      next: (summary) => {
        this.orderSummary.set(summary);
        console.log('📊 Résumé de commande:', summary);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du résumé:', error);
      },
    });
  }

  updateQuantity(itemId: number, delta: number): void {
    const currentCart = this.cart();
    if (!currentCart) return;

    const item = currentCart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.isAnimating.set(true);

    this.cartService.updateCartItem(itemId, newQuantity).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loadOrderSummary();
        setTimeout(() => this.isAnimating.set(false), 300);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        this.notificationService.error(
          'Erreur de mise à jour',
          'Impossible de mettre à jour la quantité. Veuillez réessayer.'
        );
        this.isAnimating.set(false);
      },
    });
  }

  removeItem(itemId: number): void {
    this.confirmationService.confirmDelete(
      'Supprimer cet article ?',
      'Voulez-vous vraiment retirer cet article de votre panier ?',
      () => {
        this.cartService.removeFromCart(itemId).subscribe({
          next: (cart) => {
            this.cart.set(cart);
            if (cart.items.length > 0) {
              this.loadOrderSummary();
            } else {
              this.orderSummary.set(null);
            }
            this.notificationService.success(
              'Article supprimé',
              "L'article a été retiré de votre panier"
            );
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.notificationService.error(
              'Erreur de suppression',
              "Impossible de supprimer l'article. Veuillez réessayer."
            );
          },
        });
      }
    );
  }

  clearCart(): void {
    this.confirmationService.confirmDelete(
      'Vider le panier ?',
      'Tous les articles seront retirés de votre panier. Cette action est irréversible.',
      () => {
        this.cartService.clearCart().subscribe({
          next: () => {
            const emptyCart: Cart = {
              id: 0,
              userId: 0,
              restaurantId: null,
              restaurantName: null,
              items: [],
              subtotal: 0,
              totalItems: 0,
            };

            this.cart.set(emptyCart);
            this.orderSummary.set(null);
            this.cartService.loadCart();

            this.notificationService.success(
              'Panier vidé',
              'Tous les articles ont été retirés de votre panier'
            );
          },
          error: (error) => {
            console.error('❌ Erreur lors du vidage du panier:', error);
            this.notificationService.error(
              'Erreur',
              'Impossible de vider le panier. Veuillez réessayer.'
            );
          },
        });
      }
    );
  }

  placeOrder(): void {
    const currentCart = this.cart();
    if (!currentCart || currentCart.items.length === 0) {
      this.notificationService.warning('Panier vide', 'Votre panier est vide');
      return;
    }

    const summary = this.orderSummary();
    if (!summary) {
      this.notificationService.error('Erreur', 'Impossible de calculer le résumé de la commande');
      return;
    }

    // Calcul du sous-total après subvention
    const subtotalAfterSubvention = Math.max(0, summary.subtotal - this.SUBVENTION_AMOUNT);

    // Message de confirmation détaillé
    const isFreeDelivery = summary.deliveryFeeShare === 0;

    let message = `
📦 Détails de votre commande:

Sous-total: ${this.formatAmount(summary.subtotal)} FCFA
🎁 Subvention: -${this.formatAmount(this.SUBVENTION_AMOUNT)} FCFA
➖➖➖➖➖➖➖➖➖➖➖➖➖
Montant après subvention: ${this.formatAmount(subtotalAfterSubvention)} FCFA
`;

    if (isFreeDelivery) {
      message += `🎉 Frais de livraison: GRATUIT
➖➖➖➖➖➖➖➖➖➖➖➖➖
✅ TOTAL À PAYER: ${this.formatAmount(subtotalAfterSubvention)} FCFA`;
    } else {
      message += `🚚 Frais de livraison (partagés): ${this.formatAmount(
        summary.deliveryFeeShare
      )} FCFA
➖➖➖➖➖➖➖➖➖➖➖➖➖
✅ TOTAL À PAYER: ${this.formatAmount(summary.totalAmount)} FCFA

${summary.message}`;
    }

    message += `

💡 La commande peut être passée même si votre solde est insuffisant.
    `.trim();

    this.confirmationService.confirm({
      title: '✨ Confirmer la commande',
      message,
      type: 'info',
      confirmText: '🛒 Commander',
      cancelText: 'Annuler',
      onConfirm: () => {
        this.processOrder();
      },
    });
  }

  private processOrder(): void {
    this.isOrdering.set(true);

    this.orderService.createOrder().subscribe({
      next: (order) => {
        console.log('✅ Commande créée:', order);
        this.isOrdering.set(false);

        this.cart.set(null);
        this.orderSummary.set(null);
        this.cartService.loadCart();

        this.notificationService.showWithAction(
          'success',
          '🎉 Commande validée !',
          `Votre commande #${order.id} a été créée avec succès. Montant total: ${this.formatAmount(
            order.totalAmount
          )} FCFA (subvention de ${this.SUBVENTION_AMOUNT} FCFA incluse)`,
          'Voir mes commandes',
          () => {
            this.router.navigate(['/my-orders']);
          },
          10000
        );

        setTimeout(() => {
          this.router.navigate(['/my-orders']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande:', error);
        this.isOrdering.set(false);

        let title = 'Erreur de commande';
        let message = 'Une erreur est survenue lors de la création de la commande.';

        if (error.status === 400) {
          message = error.error || 'Le panier est vide ou invalide.';
        } else if (error.status === 404) {
          message = "Le panier ou le restaurant n'a pas été trouvé.";
        } else if (error.status === 401 || error.status === 403) {
          title = 'Non autorisé';
          message = 'Vous devez être connecté pour passer une commande.';
        } else if (error.status === 500) {
          message = "Une erreur serveur s'est produite. Veuillez réessayer.";
        }

        this.notificationService.error(title, message);
      },
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Empty cart animation loaded!', animationItem);
  }

  get subtotal(): number {
    return this.cart()?.subtotal || 0;
  }

  get subtotalAfterSubvention(): number {
    return Math.max(0, this.subtotal - this.SUBVENTION_AMOUNT);
  }

  get deliveryFee(): number {
    return this.orderSummary()?.deliveryFeeShare || 0;
  }

  get total(): number {
    return this.orderSummary()?.totalAmount || this.subtotalAfterSubvention;
  }

  get cartItems(): CartItem[] {
    return this.cart()?.items || [];
  }

  get isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  get deliveryMessage(): string {
    return this.orderSummary()?.message || '';
  }

  get isFreeDelivery(): boolean {
    return this.deliveryFee === 0;
  }
}
