import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppConfig } from '../../core/config/app.config';
import { KeycloakService } from '../../features/auth/service/keycloak.service';
import { UserService, User } from '../../features/auth/service/user.service';
import { ClickOutsideDirective } from '../../shared/directives/clickOutside.directive';

@Component({
  selector: 'app-nav-component',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent implements OnInit {
  private readonly keycloakService = inject(KeycloakService);
  private readonly userService = inject(UserService);

  logoUrl = AppConfig.logoUrl;
  avatarUrl: string | null = null;

  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  userMenuOpen = signal(false);

  keycloakInfo = signal<{
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);

  ngOnInit() {
    this.checkAuthentication();
  }

  private checkAuthentication() {
    this.isAuthenticated.set(this.keycloakService.isAuthenticated());

    if (this.isAuthenticated()) {
      // Récupérer les infos depuis Keycloak immédiatement
      this.keycloakInfo.set(this.keycloakService.getUserInfo());
      // console.log('👤 Keycloak info:', this.keycloakInfo());

      // Charger l'utilisateur depuis le backend (peut prendre un peu de temps)
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);

        if (user.avatarUrl) {
          this.avatarUrl = user.avatarUrl;
        } else {
          this.avatarUrl = this.generateAvatar(user);
        }
      },
      error: (error) => {
        const info = this.keycloakInfo();
        if (info?.firstName || info?.lastName) {
          this.avatarUrl = this.generateAvatarFromKeycloak(info);
        }
      },
    });
  }

  toggleUserMenu() {
    this.userMenuOpen.update((v) => !v);
  }

  logout() {
    this.keycloakService.logout();
    this.userService.clearCurrentUser();
    this.currentUser.set(null);
    this.keycloakInfo.set(null);
    this.isAuthenticated.set(false);
  }

  login() {
    this.keycloakService.login();
  }

  // Générer l'URL de l'avatar
  private generateAvatar(user: User): string {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=25509d&color=fff&bold=true&size=128`;
  }

  private generateAvatarFromKeycloak(info: any): string {
    const name = `${info.firstName || ''} ${info.lastName || ''}`.trim() || info.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=25509d&color=fff&bold=true&size=128`;
  }

  // Récupérer le nom d'affichage
  getDisplayName(): string {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    }

    const keycloak = this.keycloakInfo();
    if (keycloak) {
      return (
        `${keycloak.firstName || ''} ${keycloak.lastName || ''}`.trim() ||
        keycloak.username ||
        'Utilisateur'
      );
    }

    return 'Utilisateur';
  }

  // Récupérer l'email d'affichage
  getDisplayEmail(): string {
    return this.currentUser()?.email || this.keycloakInfo()?.email || '';
  }

  // Récupérer les initiales pour l'avatar
  getInitials(): string {
    const user = this.currentUser();
    if (user) {
      const first = user.firstName?.[0] || '';
      const last = user.lastName?.[0] || '';
      return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
    }

    const keycloak = this.keycloakInfo();
    if (keycloak) {
      const first = keycloak.firstName?.[0] || '';
      const last = keycloak.lastName?.[0] || '';
      return (first + last).toUpperCase() || keycloak.username?.[0]?.toUpperCase() || 'U';
    }

    return 'U';
  }
}
