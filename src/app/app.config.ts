import {
  ApplicationConfig,
  LOCALE_ID,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  PLATFORM_ID,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { KeycloakService } from './features/auth/service/keycloak.service';
import { tokenInterceptor } from './features/auth/token.interceptor';

export function initializeKeycloak(
  keycloakService: KeycloakService,
  platformId: Object
): () => Promise<boolean> {
  return () => {
    if (isPlatformBrowser(platformId)) {
      console.log('🔐 Initializing Keycloak in browser...');
      return keycloakService.init();
    }
    console.log('⚠️ Skipping Keycloak initialization (SSR)');
    return Promise.resolve(false);
  };
}
registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    provideLottieOptions({
      player: () => player,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, PLATFORM_ID],
    },
  ],
};
