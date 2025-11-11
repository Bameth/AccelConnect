import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaConfig, FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fontAwesomeIcons } from './shared/font-awesome-icons';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ConfirmationComponent } from './shared/components/notification/confirmation.component';
import { UserService } from './features/auth/service/user.service';
import { CartService } from './features/restauration/services/impl/cart.service';
import { KeycloakService } from './features/auth/service/keycloak.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent, ConfirmationComponent,FontAwesomeModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('AccelConnectFront');
  private readonly faIconLibrary = inject(FaIconLibrary);
  private readonly faConfig = inject(FaConfig);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.initFontAwesome();
    if (isPlatformBrowser(this.platformId)) {
      this.initializeApp();
    }
  }

  /**
   * 🚀 Initialise l'application
   */
  private initializeApp(): void {
    // Vérifier l'authentification
    if (this.keycloakService.isAuthenticated()) {
      // console.log('✅ User authenticated, loading session...');
      this.initializeUserSession();
    } else {
      console.log('ℹ️ User not authenticated');
      this.cartService.clearUserSession();
    }
  }

  /**
   * 👤 Initialise la session utilisateur
   */
  private initializeUserSession(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        // console.log('✅ Utilisateur chargé:', user.username);
        // console.log('🎭 Rôles:', this.keycloakService.getUserRoles());

        // Initialiser le panier
        this.cartService.initializeForUser(user.id);
        // console.log('🛒 Panier initialisé pour userId:', user.id);
      },
      error: (error) => {
        console.error('❌ Erreur chargement utilisateur:', error);
        this.cartService.clearUserSession();

        // Si l'utilisateur n'existe pas en base
        if (error.status === 404) {
          console.log('🔄 User not found in DB, will be created on next request');
        }
      },
    });
  }

  /**
   * 🎨 Initialise Font Awesome
   */
  private initFontAwesome(): void {
    this.faConfig.defaultPrefix = 'fas';
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }
}
