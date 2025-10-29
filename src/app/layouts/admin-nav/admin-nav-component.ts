import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavigationLink } from './navlink';
import { AppConfig } from '../../core/config/app.config';

@Component({
  selector: 'app-admin-nav-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './admin-nav-component.html',
  styleUrl: './admin-nav-component.css',
})
export class AdminNavComponent {
  mobileMenuOpen = false;
  userMenuOpen = false;
  logoUrl = AppConfig.logoUrl;

  navigationLinks: NavigationLink[] = [
    { name: 'Dashboard', route: '/admin', icon: 'house' },
    { name: 'Ajouter Plat', route: '/admin/add-food', icon: 'plus' },
    { name: 'Assigner Plat', route: '/admin/add-food-to-restau', icon: 'utensils' },
    { name: 'Liste des Plats', route: '/admin/liste-food', icon: 'list' },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
