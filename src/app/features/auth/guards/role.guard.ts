import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { isPlatformBrowser } from '@angular/common';

export const adminOnlyGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  // ⚠️ En SSR, autoriser le passage
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloakService.isAuthenticated()) {
    console.log('⚠️ User not authenticated, redirecting to login');
    keycloakService.login();
    return false;
  }

  const isAdmin = keycloakService.isAdmin();

  if (isAdmin) {
    console.log('✅ Admin access granted');
    return true;
  }

  console.log('🚫 Access denied - Admin only, redirecting to home');
  router.navigate(['/']);
  return false;
};
