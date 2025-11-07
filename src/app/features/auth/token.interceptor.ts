import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from './service/keycloak.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Ne pas ajouter le token pour les URLs externes ou en SSR
  if (!req.url.includes('localhost:8085')) {
    return next(req);
  }

  // ✅ En SSR, ne pas essayer d'ajouter de token
  if (!isPlatformBrowser(platformId)) {
    console.log('⚠️ SSR detected - skipping token for:', req.url);
    return next(req);
  }

  const keycloakService = inject(KeycloakService);
  const token = keycloakService.getToken();

  // Si pas de token disponible, ne pas ajouter le header
  if (!token) {
    console.warn('⚠️ No token available for request to:', req.url);
    // Ne pas bloquer la requête, laisser le backend répondre 401
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Redirecting to login');
          keycloakService.login();
        }
        return throwError(() => error);
      })
    );
  }

  // Ajouter le token Bearer
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('🔑 Token added to request:', req.url);

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalide ou expiré');
        // Rediriger vers login
        keycloakService.login();
      }
      return throwError(() => error);
    })
  );
};
