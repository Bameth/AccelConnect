
import { Injectable } from '@angular/core';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak!: Keycloak;

  init(): Promise<void> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8585/',
      realm: 'accel',
      clientId: 'accel-client'
    });

    return this.keycloak.init({
      onLoad: 'login-required'
    }).then(authenticated => {
      console.log('Authenticated:', authenticated);
    });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  logout(): void {
    this.keycloak.logout();
  }

  login(): void {
    this.keycloak.login();
  }

  isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated || !!this.keycloak?.token;
  }

  getTokenParsed(): KeycloakTokenParsed | undefined {
    return this.keycloak?.tokenParsed as KeycloakTokenParsed | undefined;
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const tokenParsed = this.getTokenParsed();
    const realmRoles: string[] = (tokenParsed as any)?.realm_access?.roles || [];
    const resourceRoles: string[] = Object.values((tokenParsed as any)?.resource_access || {})
      .flatMap((res: any) => res?.roles || []);
    const allRoles = new Set<string>([...realmRoles, ...resourceRoles]);
    return requiredRoles.some((role) => allRoles.has(role));
  }
}
