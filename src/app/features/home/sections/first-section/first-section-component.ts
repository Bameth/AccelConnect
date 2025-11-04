import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppConfig } from '../../../../core/config/app.config';
import { MenuTransitionComponent } from '../../../../shared/components/menu-transition/menu-transition-component';
import { AlexChatComponent } from "../../alex-chat/alex-chat-component";

@Component({
  selector: 'app-first-section-component',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuTransitionComponent, AlexChatComponent],
  templateUrl: './first-section-component.html',
  styleUrl: './first-section-component.css',
})
export class FirstSectionComponent implements AfterViewInit {
  chatOpen = false;
  icons = AppConfig.icons;
  iconTitles = AppConfig.iconTitles;
  iconRoutes = AppConfig.iconRoutes;

  lottieAnimations = AppConfig.lottieAnimations;
  animationTitles = AppConfig.animationTitles;
  animationThemes = AppConfig.animationThemes;

  showTransition = false;
  pendingRoute: string | null = null;
  currentAnimationIndex: number = 0;

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isMuted = true;
  duration = 0;
  currentTime = 0;
  progress = 0;
  currentTimeDisplay = '0:00';
  durationDisplay = '0:00';

  constructor(private readonly router: Router) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const video = this.heroVideo?.nativeElement;
    if (!video) return;

    video.muted = true;
    video
      .play()
      .then(() => (this.isPlaying = true))
      .catch((err) => console.warn('Autoplay bloqué:', err));
  }

  // 🆕 Méthode pour gérer le clic sur une icône avec animation
  onIconClick(event: Event, index: number): void {
    event.preventDefault();

    // Sauvegarder l'index et la route
    this.currentAnimationIndex = index;
    this.pendingRoute = this.iconRoutes[index];

    // Afficher l'animation
    this.showTransition = true;
  }

  // 🆕 Méthode appelée quand l'animation est terminée
  onTransitionComplete(): void {
    this.showTransition = false;
    if (this.pendingRoute) {
      this.router.navigate([this.pendingRoute]);
      this.pendingRoute = null;
    }
  }

  // 🆕 Obtenir l'animation actuelle
  getCurrentAnimation(): string {
    return this.lottieAnimations[this.currentAnimationIndex] || this.lottieAnimations[0];
  }

  // 🆕 Obtenir le titre de l'animation actuelle
  getCurrentAnimationTitle(): string {
    return this.animationTitles[this.currentAnimationIndex] || this.animationTitles[0];
  }

  // 🆕 Obtenir le thème de l'animation actuelle
  getCurrentAnimationTheme(): { primary: string; secondary: string } {
    return this.animationThemes[this.currentAnimationIndex] || this.animationThemes[0];
  }

  togglePlayPause(event: Event): void {
    event.stopPropagation();
    const video = this.heroVideo.nativeElement;

    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  toggleMute(event: Event): void {
    event.stopPropagation();
    const video = this.heroVideo.nativeElement;

    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  toggleFullscreen(event: Event): void {
    event.stopPropagation();
    const container = this.videoContainer.nativeElement;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onTimeUpdate(): void {
    const video = this.heroVideo.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (this.currentTime / video.duration) * 100;
    this.currentTimeDisplay = this.formatTime(this.currentTime);
  }

  onMetadataLoaded(): void {
    const video = this.heroVideo.nativeElement;
    this.duration = video.duration;
    this.durationDisplay = this.formatTime(video.duration);
  }

  seekVideo(event: MouseEvent): void {
    event.stopPropagation();
    const video = this.heroVideo.nativeElement;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const ratio = clickX / rect.width;
    video.currentTime = ratio * video.duration;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
  }
}
