import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);

  // ⚠️ En SSR, toujours autoriser le passage - l'auth sera vérifiée côté client
  if (!isPlatformBrowser(platformId)) {
    console.log('⚙️ SSR: Auth guard bypassed');
    return true;
  }

  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  // Attendre que Keycloak soit initialisé
  try {
    await keycloakService.init();
  } catch (error) {
    console.error('❌ Keycloak init failed in guard:', error);
  }

  if (keycloakService.isAuthenticated()) {
    console.log('✅ Auth guard: User authenticated');
    return true;
  }

  console.log('⚠️ Auth guard: User not authenticated, redirecting to login');

  // Rediriger vers Keycloak pour l'authentification
  try {
    await keycloakService.login();
    return false;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    router.navigate(['/']);
    return false;
  }
};
