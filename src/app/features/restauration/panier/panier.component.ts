import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CartService } from '../services/impl/cart.service';
import { OrderService } from '../services/impl/order.service';
import { NotificationService } from '../../../core/services/impl/notification.service';
import { ConfirmationService } from '../../../core/services/impl/ConfirmationDialog.service';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, LottieComponent, RouterModule],
  templateUrl: './panier-component.html',
  styleUrl: './panier-component.css',
})
export class PanierComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);

  cartSummary = computed(() => this.cartService.cartSummary());
  isOrdering = signal(false);
  isLoading = signal(false);

  emptyCartOptions: AnimationOptions = {
    path: '/assets/lottie/emptycart.json',
    loop: true,
    autoplay: true,
  };

  ngOnInit(): void {
    // Valider les items du panier au chargement
    this.validateCart();
  }

  /**
   * ✅ Valide que les items du panier sont toujours disponibles
   */
  validateCart(): void {
    this.isLoading.set(true);
    this.cartService.validateCartItems().subscribe({
      next: ({ validItems, removedItems }) => {
        this.isLoading.set(false);

        if (removedItems.length > 0) {
          const itemNames = removedItems.map((item) => item.mealName).join(', ');
          this.notificationService.warning(
            'Articles retirés',
            `${removedItems.length} article(s) retiré(s) du panier car non disponible(s) aujourd'hui : ${itemNames}`
          );
        }
      },
      error: (error) => {
        console.error('❌ Erreur validation panier:', error);
        this.isLoading.set(false);
      },
    });
  }

  updateQuantity(mealId: number, restaurantId: number, delta: number): void {
    const summary = this.cartSummary();
    const item = summary.items.find((i) => i.mealId === mealId && i.restaurantId === restaurantId);

    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      this.removeItem(mealId, restaurantId);
    } else {
      this.cartService.updateQuantity(mealId, restaurantId, newQuantity);
    }
  }

  removeItem(mealId: number, restaurantId: number): void {
    this.confirmationService.confirmDelete(
      'Supprimer cet article ?',
      'Voulez-vous vraiment retirer cet article de votre panier ?',
      () => {
        this.cartService.removeItem(mealId, restaurantId);
        this.notificationService.success('Article supprimé', "L'article a été retiré");
      }
    );
  }

  clearCart(): void {
    this.confirmationService.confirmDelete(
      'Vider le panier ?',
      'Tous les articles seront retirés.',
      () => {
        this.cartService.clear();
        this.notificationService.success('Panier vidé', 'Tous les articles ont été retirés');
      }
    );
  }

  placeOrder(): void {
    const summary = this.cartSummary();

    if (summary.totalItems === 0) {
      this.notificationService.warning('Panier vide', 'Votre panier est vide');
      return;
    }

    // Valider une dernière fois avant de commander
    this.isLoading.set(true);
    this.cartService.validateCartItems().subscribe({
      next: ({ validItems, removedItems }) => {
        this.isLoading.set(false);

        if (removedItems.length > 0) {
          const itemNames = removedItems.map((item) => item.mealName).join(', ');
          this.notificationService.error(
            'Articles indisponibles',
            `Certains articles ne sont plus disponibles : ${itemNames}`
          );
          return;
        }

        if (validItems.length === 0) {
          this.notificationService.warning('Panier vide', 'Votre panier est vide');
          return;
        }

        // Continuer avec la confirmation
        this.confirmationService.confirm({
          title: 'Confirmer la commande',
          message: 'Êtes-vous sûr de vouloir passer cette commande ?',
          type: 'info',
          confirmText: 'Commander',
          cancelText: 'Annuler',
          onConfirm: () => {
            this.processOrder();
          },
        });
      },
      error: (error) => {
        console.error('❌ Erreur validation:', error);
        this.isLoading.set(false);
        this.notificationService.error(
          'Erreur de validation',
          'Impossible de valider votre panier'
        );
      },
    });
  }

  private processOrder(): void {
    this.isOrdering.set(true);

    const payload = this.cartService.prepareOrderData();

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.isOrdering.set(false);
        this.cartService.clear();
        setTimeout(() => {
          this.router.navigate(['restauration/my-orders']);
        }, 300);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.isOrdering.set(false);

        let message = 'Une erreur est survenue.';

        if (error.status === 400) {
          if (error.error?.includes('annulé')) {
            message =
              "Vous avez annulé votre commande du jour. Vous ne pouvez plus commander aujourd'hui.";
          } else if (error.error?.includes('12h')) {
            message = "Il est trop tard pour commander ou modifier aujourd'hui (après 12h).";
          } else {
            message = error.error || message;
          }
        } else if (error.status === 401) {
          message = 'Vous devez être connecté.';
        }

        this.notificationService.error('Erreur de commande', message);
      },
    });
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Empty cart animation loaded!', animationItem);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  get isEmpty(): boolean {
    return this.cartSummary().totalItems === 0;
  }
}
