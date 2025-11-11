import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { ExtendedKeycloakTokenParsed } from '../model/keycloak.model';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private keycloak!: Keycloak;
  private initialized = false;
  private initPromise: Promise<boolean> | null = null;

  async init(): Promise<boolean> {
    // Ne pas initialiser Keycloak côté serveur
    if (!isPlatformBrowser(this.platformId)) {
      // console.log('⚠️ Keycloak initialization skipped (SSR)');
      return false;
    }

    // Si déjà en cours d'initialisation, retourner la promesse existante
    if (this.initPromise) {
      return this.initPromise;
    }

    // Si déjà initialisé, retourner true
    if (this.initialized) {
      return true;
    }

    // Créer la promesse d'initialisation
    this.initPromise = this.performInit();
    return this.initPromise;
  }

  private async performInit(): Promise<boolean> {
    try {
      this.keycloak = new Keycloak({
        url: 'https://sso-01.heritage.africa',
        realm: 'heritage-internal',
        clientId: 'accel-connect',
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        enableLogging: true,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      });

      this.initialized = true;

      if (authenticated) {
        // console.log('✅ User authenticated via Keycloak');
        // console.log('👤 User roles:', this.getUserRoles());
        // console.log('🔑 Token available:', !!this.keycloak.token);
        this.setupTokenRefresh();

        // Rediriger uniquement si on est sur la racine
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '') {
          this.redirectBasedOnRole();
        }
      } else {
        console.log('ℹ️ User not authenticated');
      }

      return authenticated;
    } catch (error) {
      console.error('❌ Keycloak initialization failed:', error);
      this.initialized = false;
      this.initPromise = null;
      return false;
    }
  }

  /**
   * 🔄 Redirige automatiquement selon le rôle
   */
  private redirectBasedOnRole(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isAdmin = this.isAdmin();

    if (isAdmin) {
      // console.log('↪️ Redirecting admin to /admin');
      this.router.navigate(['/admin']);
    } else {
      // console.log('↪️ Keeping user on home page');
    }
  }

  private setupTokenRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setInterval(() => {
      this.keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            // console.log('🔄 Token refreshed');
          }
        })
        .catch(() => {
          console.error('❌ Failed to refresh token');
          this.login();
        });
    }, 60000);
  }

  getToken(): string | undefined {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) {
      return undefined;
    }
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
    if (!isPlatformBrowser(this.platformId) || !this.initialized) {
      return false;
    }
    return !!this.keycloak?.authenticated;
  }

  getTokenParsed(): ExtendedKeycloakTokenParsed | undefined {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) {
      return undefined;
    }
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

  /**
   * 🔍 Vérifie si l'utilisateur a au moins un des rôles requis
   */
  hasAnyRole(requiredRoles: string[]): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) {
      return false;
    }
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const tokenParsed = this.getTokenParsed();

    const realmRoles: string[] = tokenParsed?.['realm_access']?.['roles'] || [];
    const clientRoles: string[] = tokenParsed?.['resource_access']?.['accel-connect']?.['roles'] || [];

    const allRoles = new Set<string>([...realmRoles, ...clientRoles]);

    return requiredRoles.some((role) => {
      const normalizedRole = role.toLowerCase();
      return Array.from(allRoles).some((userRole) => userRole.toLowerCase() === normalizedRole);
    });
  }

  /**
   * 🔐 Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  /**
   * 👑 Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['ROLE_ADMIN', 'role_admin', 'admin']);
  }

  /**
   * 📋 Récupère tous les rôles de l'utilisateur
   */
  getUserRoles(): string[] {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) {
      return [];
    }

    const tokenParsed = this.getTokenParsed();
    const realmRoles: string[] = tokenParsed?.['realm_access']?.['roles'] || [];
    const clientRoles: string[] = tokenParsed?.['resource_access']?.['accel']?.['roles'] || [];

    return [...new Set([...realmRoles, ...clientRoles])];
  }
}
