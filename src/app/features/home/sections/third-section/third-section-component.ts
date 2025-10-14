import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces pour typage fort (préparation backend)
export interface FrequentSite {
  id?: string;
  name: string;
  image: string;
  url: string;
  alt: string;
  clicks?: number;
  category?: string;
}

export interface Profile {
  id?: string;
  name: string;
  image: string;
  title: string;
  description: string;
  email?: string;
  department?: string;
  isNew?: boolean;
}

export interface Citation {
  id?: string;
  author: string;
  image: string;
  role?: string;
  quote: string;
  date?: Date;
}

export interface Statistic {
  id?: string;
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  trend?: number; // Pourcentage d'évolution
}

@Component({
  selector: 'app-third-section-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './third-section-component.html',
  styleUrl: './third-section-component.css',
})
export class ThirdSectionComponent implements OnInit {
  // 🔗 Sites fréquents (à charger depuis le backend)
  frequentSites: FrequentSite[] = [
    {
      id: '1',
      name: 'Baobab+',
      image: 'assets/site1_baobab.png',
      url: 'https://baobab.sn',
      alt: 'Baobab+',
      category: 'Finance',
    },
    {
      id: '2',
      name: 'AccelHub',
      image: 'assets/site2_accel.png',
      url: 'https://accelhub.sn',
      alt: 'AccelHub',
      category: 'Innovation',
    },
    {
      id: '3',
      name: 'Shirikia',
      image: 'assets/shirikia.png',
      url: 'https://shirikia.com',
      alt: 'Shirikia',
      category: 'Partenaires',
    },
  ];

  // 👥 Profils de bienvenue (à charger depuis le backend)
  profiles: Profile[] = [
    {
      id: '1',
      name: 'SEYNABOU NDOUR',
      image: 'assets/seynabou.jpg',
      title: 'Directrice des Ressources Humaines',
      description:
        "Passionnée par le développement des talents et la création d'un environnement de travail épanouissant pour tous.",
      email: 'seynabou.ndour@accel.sn',
      department: 'RH',
      isNew: false,
    },
    {
      id: '2',
      name: 'TAMSIR NDIAYE',
      image: 'assets/tamsir.jpg',
      title: 'Chef de Projet Innovation',
      description:
        "Expert en transformation digitale avec une vision stratégique pour l'avenir de notre entreprise.",
      email: 'tamsir.ndiaye@accel.sn',
      department: 'Innovation',
      isNew: true,
    },
    {
      id: '3',
      name: 'MOUSSA TRAORE',
      image: 'assets/moussa.jpg',
      title: 'Responsable Commercial',
      description:
        'Leader commercial orienté résultats, spécialisé dans le développement de relations clients durables.',
      email: 'moussa.traore@accel.sn',
      department: 'Commercial',
      isNew: false,
    },
  ];

  // 💬 Citation du jour (à charger depuis le backend)
  citation: Citation = {
    id: '1',
    author: 'Thomas Sankara',
    image: 'assets/sankara.jpg',
    role: 'Leader révolutionnaire',
    quote:
      "Nous devons accepter de vivre africain. C'est la seule façon de vivre libre et de vivre digne.",
    date: new Date(),
  };

  // 📊 Statistiques (à charger depuis le backend)
  stats: Statistic[] = [
    {
      id: '1',
      label: 'Collaborateurs',
      value: '250',
      suffix: '+',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
      trend: 12,
    },
    {
      id: '2',
      label: 'Projets actifs',
      value: '42',
      suffix: '',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
      trend: 8,
    },
    {
      id: '3',
      label: 'Pays',
      value: '15',
      suffix: '',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      trend: 5,
    },
    {
      id: '4',
      label: 'Satisfaction',
      value: '98',
      suffix: '%',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      trend: 3,
    },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge toutes les données depuis le backend
   * TODO: Implémenter les appels API
   */
  private loadData(): void {
    this.loadFrequentSites();
    this.loadProfiles();
    this.loadCitation();
    this.loadStatistics();
  }

  /**
   * Charge les sites fréquents depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadFrequentSites(): void {
    // this.siteService.getFrequentSites().subscribe(sites => {
    //   this.frequentSites = sites;
    // });
  }

  /**
   * Charge les profils de bienvenue depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadProfiles(): void {
    // this.profileService.getFeaturedProfiles().subscribe(profiles => {
    //   this.profiles = profiles;
    // });
  }

  /**
   * Charge la citation du jour depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadCitation(): void {
    // this.citationService.getDailyCitation().subscribe(citation => {
    //   this.citation = citation;
    // });
  }

  /**
   * Charge les statistiques depuis le backend
   * TODO: Implémenter l'appel API
   */
  private loadStatistics(): void {
    // this.statsService.getCompanyStats().subscribe(stats => {
    //   this.stats = stats;
    // });
  }

  /**
   * Ajoute un site aux favoris
   * TODO: Implémenter l'appel API
   */
  addToFavorites(site: FrequentSite): void {
    console.log('Adding to favorites:', site);
    // this.siteService.addToFavorites(site.id).subscribe(() => {
    //   // Notification de succès
    // });
  }

  /**
   * Envoie un email à un profil
   * TODO: Implémenter l'action d'envoi d'email
   */
  contactProfile(profile: Profile): void {
    if (profile.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  /**
   * Navigue vers le profil détaillé
   * TODO: Implémenter la navigation avec Router
   */
  viewProfile(profile: Profile): void {
    console.log('View profile:', profile);
    // this.router.navigate(['/profile', profile.id]);
  }

  /**
   * Like une citation
   * TODO: Implémenter l'appel API
   */
  likeCitation(): void {
    console.log('Liking citation:', this.citation.id);
    // this.citationService.likeCitation(this.citation.id).subscribe(() => {
    //   // Mise à jour du nombre de likes
    // });
  }

  /**
   * Partage une citation
   * TODO: Implémenter le partage sur les réseaux sociaux
   */
  shareCitation(): void {
    console.log('Sharing citation:', this.citation.quote);
    // Implémentation du partage
    if (navigator.share) {
      navigator.share({
        title: `Citation de ${this.citation.author}`,
        text: this.citation.quote,
      });
    }
  }

  /**
   * Track by function pour les listes
   */
  trackById(index: number, item: any): string {
    return item.id || index;
  }
}
