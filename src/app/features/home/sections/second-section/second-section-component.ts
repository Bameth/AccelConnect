import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces pour typage fort (préparation backend)
export interface NewsItem {
  id?: string;
  img: string;
  href: string;
  title: string;
  excerpt: string;
  category?: string;
  date?: string;
  readTime?: string;
  author?: string;
}

export interface Resource {
  id?: string;
  name: string;
  url: string;
  icon?: string;
}

export interface RecentResource {
  id?: string;
  name: string;
  date: string;
  type?: string;
}

export interface Birthday {
  id?: string;
  name: string;
  date: Date;
  avatar?: string;
}

@Component({
  selector: 'app-second-section-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './second-section-component.html',
  styleUrl: './second-section-component.css',
})
export class SecondSectionComponent implements OnInit {
  // 📅 Données du calendrier
  readonly now = new Date();
  year = this.now.getFullYear();
  month = this.now.getMonth() + 1;
  selectedDay: number | null = this.now.getDate();

  monthName = new Date(this.year, this.month - 1, 1).toLocaleString('fr-FR', { month: 'long' });
  readonly weekDays = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  calendarCells: Array<number | null> = [];

  // 📰 Données actualités (à remplacer par appel API)
  newsItems: NewsItem[] = [
    {
      id: '1',
      img: 'assets/News2.jpg',
      href: '#',
      title: 'Lancement du nouveau programme de formation',
      excerpt:
        'Découvrez les nouvelles opportunités de développement professionnel disponibles pour tous les collaborateurs.',
      category: 'Formation',
      date: 'Il y a 2 heures',
      readTime: '5 min',
    },
    {
      id: '2',
      img: 'assets/News3.jpg',
      href: '#',
      title: 'Résultats trimestriels exceptionnels',
      excerpt:
        'Notre entreprise affiche une croissance remarquable ce trimestre avec des performances au-delà des objectifs.',
      category: 'Business',
      date: 'Hier',
      readTime: '3 min',
    },
    {
      id: '3',
      img: 'assets/News1.jpg',
      href: '#',
      title: 'Nouveau partenariat stratégique annoncé',
      excerpt:
        "AccelConnect s'associe avec des leaders du secteur pour renforcer sa position sur le marché.",
      category: 'Actualité',
      date: 'Il y a 3 jours',
      readTime: '4 min',
    },
  ];

  hoveredCard: number | null = null;

  // 🎂 Anniversaires (à connecter au backend)
  birthdays: Birthday[] = [];

  // 📚 Ressources
  topResources: Resource[] = [
    { id: '1', name: 'Omni 365', url: '#' },
    { id: '2', name: 'Vision Accel', url: '#' },
    { id: '3', name: 'Kaarangué', url: '#' },
  ];

  recentResources: RecentResource[] = [
    { id: '1', name: "Guide d'onboarding 2025", date: "Ajouté aujourd'hui" },
    { id: '2', name: 'Politiques RH mises à jour', date: 'Il y a 2 jours' },
    { id: '3', name: 'Manuel IT & Sécurité', date: 'Il y a 1 semaine' },
  ];

  // 🖼️ Images statiques
  readonly birthdayIcon = 'assets/birthday.png';
  readonly bannerImage = 'assets/banner.jpg';
  readonly ressourcesImg = 'assets/ressources.jpg';
  readonly topRessourceIcon = 'assets/topressource.png';

  ngOnInit(): void {
    this.generateCalendar();
    this.loadBirthdays();
    // TODO: Charger les données depuis le backend
    // this.loadNews();
    // this.loadResources();
  }

  /** Génère la grille du calendrier */
  generateCalendar(): void {
    const firstWeekday = new Date(this.year, this.month - 1, 1).getDay();
    const daysInMonth = new Date(this.year, this.month, 0).getDate();

    this.calendarCells = [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Compléter pour avoir des semaines complètes
    while (this.calendarCells.length % 7 !== 0) {
      this.calendarCells.push(null);
    }
  }

  /** Navigation mois précédent */
  prevMonth(): void {
    if (this.month === 1) {
      this.year--;
      this.month = 12;
    } else {
      this.month--;
    }
    this.updateCalendar();
  }

  /** Navigation mois suivant */
  nextMonth(): void {
    if (this.month === 12) {
      this.year++;
      this.month = 1;
    } else {
      this.month++;
    }
    this.updateCalendar();
  }

  /** Met à jour le calendrier après navigation */
  private updateCalendar(): void {
    this.monthName = new Date(this.year, this.month - 1, 1).toLocaleString('fr-FR', {
      month: 'long',
    });
    this.generateCalendar();

    // Réinitialiser la sélection si on est sur le mois courant
    this.selectedDay =
      this.year === this.now.getFullYear() && this.month === this.now.getMonth() + 1
        ? this.now.getDate()
        : null;
  }

  /** Sélection d'un jour */
  selectDay(day: number | null): void {
    if (day && this.isCurrentMonth(day)) {
      this.selectedDay = day;
      // TODO: Émettre un événement ou charger les événements du jour
      this.loadEventsForDay(day);
    }
  }

  /** Vérifie si c'est aujourd'hui */
  isToday(day: number | null): boolean {
    return (
      day !== null &&
      day === this.now.getDate() &&
      this.year === this.now.getFullYear() &&
      this.month === this.now.getMonth() + 1
    );
  }

  /** Détecte les dimanches */
  isSunday(index: number): boolean {
    return index % 7 === 0;
  }

  /** Vérifie si le jour appartient au mois courant */
  isCurrentMonth(day: number | null): boolean {
    return day !== null;
  }

  /** Suivi des boucles ngFor */
  trackByIndex(index: number): number {
    return index;
  }

  /** Hover sur les cartes d'actualité */
  setHoveredCard(index: number | null): void {
    this.hoveredCard = index;
  }

  /** Style dynamique pour les cartes d'actualités */
  getCardStyle(index: number) {
    const baseW = 500;
    const baseH = 500;
    const vOffset = baseH * 0.4;
    const hOffset = baseW * 0.14;

    const layers = [
      { top: 0, right: 0, z: 10 },
      { top: vOffset, right: hOffset, z: 20 },
      { top: vOffset * 2, right: hOffset * 2, z: 30 },
    ];

    const layer = layers[index];
    const isHovered = this.hoveredCard === index;

    return {
      top: `${layer.top}px`,
      right: `${layer.right}px`,
      width: `${baseW}px`,
      height: `${baseH}px`,
      transform: `translate3d(${isHovered ? '-8px' : '0'},${isHovered ? '-8px' : '0'},0) scale(${
        isHovered ? 1.04 : 1
      })`,
      zIndex: isHovered ? 50 : layer.z,
      boxShadow: isHovered
        ? '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)'
        : '0 15px 35px rgba(0,0,0,0.25)',
      filter: isHovered ? 'saturate(1.1) brightness(1.05)' : 'saturate(0.95)',
      transition: 'all .35s cubic-bezier(.2,.85,.2,1)',
    };
  }

  // ====== Méthodes pour l'intégration backend ======

  /**
   * Charge les actualités depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadNews(): void {
    // this.newsService.getLatestNews().subscribe(news => {
    //   this.newsItems = news;
    // });
  }

  /**
   * Charge les anniversaires depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadBirthdays(): void {
    // this.birthdayService.getTodayBirthdays().subscribe(birthdays => {
    //   this.birthdays = birthdays;
    // });
  }

  /**
   * Charge les ressources depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadResources(): void {
    // this.resourceService.getTopResources().subscribe(resources => {
    //   this.topResources = resources;
    // });
  }

  /**
   * Charge les événements pour un jour spécifique
   * TODO: Implémenter l'appel API
   */
  private loadEventsForDay(day: number): void {
    const selectedDate = new Date(this.year, this.month - 1, day);
    console.log('Loading events for:', selectedDate);
    // this.eventService.getEventsByDate(selectedDate).subscribe(events => {
    //   // Traiter les événements
    // });
  }
}
