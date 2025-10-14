import { Component, OnInit, inject } from '@angular/core';
import { AppConfig } from '../../../../core/config/app.config';
import { CommonModule } from '@angular/common';

export interface QuickAccessItem {
  id: string;
  icon: string;
  title: string;
  route?: string;
  notificationCount?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-first-section-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './first-section-component.html',
  styleUrl: './first-section-component.css',
})
export class FirstSectionComponent implements OnInit {
  chatOpen = false;
  icons = AppConfig.icons;
  iconTitles = AppConfig.iconTitles;

  // Préparation pour l'intégration backend
  quickAccessItems: QuickAccessItem[] = [];

  ngOnInit(): void {
    this.initializeQuickAccessItems();
  }

  /**
   * Initialise les éléments d'accès rapide
   * TODO: Remplacer par un appel API backend
   */
  private initializeQuickAccessItems(): void {
    this.quickAccessItems = this.icons.map((icon, index) => ({
      id: `access-${index}`,
      icon,
      title: this.iconTitles[index],
      route: this.getRouteForItem(index),
      notificationCount: this.getNotificationCount(index),
      isActive: true,
    }));
  }

  /**
   * Détermine la route pour chaque élément
   * TODO: Mapper avec les routes réelles de l'application
   */
  private getRouteForItem(index: number): string {
    const routes = ['/menu', '/ressources', '/rh', '/commercial', '/moyens-generaux', '/formation'];
    return routes[index] || '/';
  }

  /**
   * Récupère le nombre de notifications pour un élément
   * TODO: Connecter à l'API backend pour les notifications en temps réel
   */
  private getNotificationCount(index: number): number | undefined {
    // Simulation - à remplacer par un appel API
    const notifications: { [key: number]: number } = {
      2: 5, // RH
      4: 2, // Moyens Généraux
    };
    return notifications[index];
  }

  /**
   * Toggle l'état du chatbot
   * TODO: Intégrer avec le service de chat backend
   */
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    // TODO: Émettre un événement ou appeler un service
    console.log('Chat state:', this.chatOpen);
  }

  /**
   * Navigation vers un élément d'accès rapide
   * TODO: Implémenter la navigation avec Router
   */
  navigateToItem(item: QuickAccessItem): void {
    if (item.route) {
      // TODO: this.router.navigate([item.route]);
      console.log('Navigate to:', item.route);
    }
  }
}
