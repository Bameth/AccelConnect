import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { KeycloakService } from './service/keycloak.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  // Ne pas ajouter le token pour les URLs externes
  if (!req.url.includes('localhost:8085')) {
    return next(req);
  }

  const token = keycloakService.getToken();

  // Si pas de token, ne pas ajouter le header (peut arriver en SSR)
  if (!token) {
    console.warn('⚠️ No token available for request to:', req.url);
    return next(req);
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
