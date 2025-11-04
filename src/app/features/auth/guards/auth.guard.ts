import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak-service';

export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (keycloakService.isAuthenticated()) {
    return true;
  }

  // Prefer native Keycloak login if available
  try {
    keycloakService.login();
  } catch {
    router.navigate(['/login']);
  }
  return false;
};


