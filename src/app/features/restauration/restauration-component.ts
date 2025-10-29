import { Component } from '@angular/core';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { RouterModule } from '@angular/router';
import { Restaurant, Stat } from '../../core/models/precharges';

@Component({
  selector: 'app-restauration-component',
  imports: [FontAwesomeModule, FaIconComponent, LottieComponent, RouterModule],
  templateUrl: './restauration-component.html',
  styleUrl: './restauration-component.css',
})
export class RestaurationComponent {
  // Days
  days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  // Stats
  stats: Stat[] = [
    {
      id: 'balance',
      label: 'Solde',
      value: '10K',
      icon: 'wallet',
      gradientFrom: '#3B82F6',
      gradientTo: '#6366F1',
    },
    {
      id: 'consumed',
      label: 'Consommé',
      value: '15K',
      icon: 'chart-line',
      gradientFrom: '#14B8A6',
      gradientTo: '#10B981',
    },
    {
      id: 'topay',
      label: 'À payer',
      value: '25K',
      icon: 'credit-card',
      gradientFrom: '#EF4444',
      gradientTo: '#EA580C',
    },
  ];

  // Restaurants Data
  restaurants: Restaurant[] = [
    {
      id: 'jolof',
      name: 'Jolof',
      subtitle: 'Spécialités sénégalaises',
      icon: 'fire',
      gradientFrom: '#E84141',
      gradientTo: '#6B140F',
      items: [
        {
          id: 'jolof-1',
          name: 'Soupe Okadia',
          price: 2500,
          emoji: '🍲',
          quantity: 2,
          gradientFrom: '#E84141',
          gradientTo: '#FF6B35',
          hoverBorder: 'red-200',
        },
        {
          id: 'jolof-2',
          name: 'Plat Okadia Complet',
          price: 4000,
          emoji: '🍽️',
          quantity: 1,
          gradientFrom: '#14B8A6',
          gradientTo: '#10B981',
          hoverBorder: 'teal-200',
        },
        {
          id: 'jolof-3',
          name: 'Brochettes mixtes',
          price: 3000,
          emoji: '🍢',
          quantity: 0,
          gradientFrom: '#2563EB',
          gradientTo: '#6366F1',
          hoverBorder: 'blue-200',
        },
      ],
    },
    {
      id: 'rodra',
      name: 'Rodra',
      subtitle: 'Dibiterie & Grillades',
      gradientFrom: '#303131',
      gradientTo: '#20264E',
      items: [
        {
          id: 'rodra-1',
          name: 'Dibi mouton',
          price: 3500,
          emoji: '🥩',
          quantity: 0,
          gradientFrom: '#D97706',
          gradientTo: '#C2410C',
          hoverBorder: 'amber-200',
        },
        {
          id: 'rodra-2',
          name: 'Yassa poulet',
          price: 3200,
          emoji: '🍗',
          quantity: 0,
          gradientFrom: '#14B8A6',
          gradientTo: '#06B6D4',
          hoverBorder: 'teal-200',
        },
        {
          id: 'rodra-3',
          name: 'Thiébou guinar',
          price: 2800,
          emoji: '🐟',
          quantity: 0,
          gradientFrom: '#3B82F6',
          gradientTo: '#A855F7',
          hoverBorder: 'purple-200',
        },
      ],
    },
    {
      id: 'eva',
      name: 'EVA',
      subtitle: 'Cuisine raffinée',
      icon: 'star',
      gradientFrom: '#25509D',
      gradientTo: '#99CFBD',
      items: [
        {
          id: 'eva-1',
          name: 'Filet mignon sauce poivre',
          price: 4500,
          emoji: '🥩',
          quantity: 0,
          gradientFrom: '#F43F5E',
          gradientTo: '#DB2777',
          hoverBorder: 'rose-200',
        },
        {
          id: 'eva-2',
          name: 'Salade César Premium',
          price: 2500,
          emoji: '🥗',
          quantity: 0,
          gradientFrom: '#22C55E',
          gradientTo: '#10B981',
          hoverBorder: 'emerald-200',
        },
        {
          id: 'eva-3',
          name: 'Risotto aux fruits de mer',
          price: 4200,
          emoji: '🦐',
          quantity: 0,
          gradientFrom: '#3B82F6',
          gradientTo: '#14B8A6',
          hoverBorder: 'teal-200',
        },
      ],
    },
  ];

  lottieOptions: AnimationOptions = {
    path: '/assets/lottie/3DChefDancing.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  selectRestaurant(arg0: string) {
    throw new Error('Method not implemented.');
  }

  selectDay(arg0: string) {
    throw new Error('Method not implemented.');
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Chef animation loaded!', animationItem);
  }
  increaseQuantity(restaurantId: string, itemId: string): void {
    // TODO: Implémenter la logique
  }

  decreaseQuantity(restaurantId: string, itemId: string): void {
    // TODO: Implémenter la logique
  }

  toggleFavorite(itemId: string): void {
    // TODO: Implémenter la logique
  }

  addToCart(restaurantId: string): void {
    // TODO: Implémenter la logique
  }
  get cartItemCount(): number {
    return this.restaurants.reduce((total, restaurant) => {
      return total + restaurant.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  }

  getRestaurantItemCount(restaurantId: string): number {
    const restaurant = this.restaurants.find((r) => r.id === restaurantId);
    return restaurant ? restaurant.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }
}
