import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);

  // ⚠️ En SSR, toujours autoriser le passage
  if (!isPlatformBrowser(platformId)) {
    console.log('⚙️ SSR: Skipping auth check');
    return true;
  }

  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (keycloakService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers Keycloak pour l'authentification
  try {
    await keycloakService.login();
    return false;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    router.navigate(['/login']);
    return false;
  }
};
