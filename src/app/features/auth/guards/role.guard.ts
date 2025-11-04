import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak-service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const requiredRoles = (route.data?.['roles'] as string[]) || [];

  if (!requiredRoles.length) {
    return true;
  }

  if (keycloakService.hasAnyRole(requiredRoles)) {
    return true;
  }

  router.navigate(['/not-found']);
  return false;
};


