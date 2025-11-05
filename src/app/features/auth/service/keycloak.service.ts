import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';
import { ExtendedKeycloakTokenParsed } from '../model/keycloak.model';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private readonly platformId = inject(PLATFORM_ID);
  private keycloak!: Keycloak;
  private initialized = false;

  async init(): Promise<boolean> {
    // Ne pas initialiser Keycloak côté serveur
    if (!isPlatformBrowser(this.platformId)) {
      console.log('⚠️ Keycloak initialization skipped (SSR)');
      return false;
    }

    if (this.initialized) {
      return true;
    }

    try {
      this.keycloak = new Keycloak({
        url: 'http://localhost:8081',
        realm: 'accel',
        clientId: 'accel',
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        enableLogging: true,
      });

      this.initialized = true;

      if (authenticated) {
        console.log('✅ User authenticated via Keycloak');
        this.setupTokenRefresh();
      } else {
        console.log('ℹ️ User not authenticated');
      }

      return authenticated;
    } catch (error) {
      console.error('❌ Keycloak initialization failed:', error);
      this.initialized = false;
      return false;
    }
  }

  private setupTokenRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setInterval(() => {
      this.keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            console.log('🔄 Token refreshed');
          }
        })
        .catch(() => {
          console.error('❌ Failed to refresh token');
          this.login();
        });
    }, 60000);
  }

  getToken(): string | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    return this.keycloak?.token;
  }

  async logout(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.keycloak.logout({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }

  async login(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await this.keycloak.login({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!this.keycloak?.authenticated;
  }

  getTokenParsed(): ExtendedKeycloakTokenParsed | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    return this.keycloak?.tokenParsed as ExtendedKeycloakTokenParsed | undefined;
  }

  getUserInfo(): {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    sub?: string;
  } {
    const token = this.getTokenParsed();
    return {
      username: token?.['preferred_username'],
      email: token?.['email'],
      firstName: token?.['given_name'],
      lastName: token?.['family_name'],
      sub: token?.['sub'],
    };
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const tokenParsed = this.getTokenParsed();

    const realmRoles: string[] = tokenParsed?.['realm_access']?.['roles'] || [];
    const clientRoles: string[] = tokenParsed?.['resource_access']?.['accel']?.['roles'] || [];

    const allRoles = new Set<string>([...realmRoles, ...clientRoles]);

    console.log('👤 User roles:', Array.from(allRoles));
    console.log('🔒 Required roles:', requiredRoles);

    return requiredRoles.some((role) => allRoles.has(role) || allRoles.has(role.toLowerCase()));
  }

  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }
}
