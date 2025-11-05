import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';

export const authGuard: CanActivateFn = async () => {
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
