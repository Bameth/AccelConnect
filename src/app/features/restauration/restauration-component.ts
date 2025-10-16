import { Component } from '@angular/core';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-restauration-component',
  imports: [FontAwesomeModule, FaIconComponent, LottieComponent],
  templateUrl: './restauration-component.html',
  styleUrl: './restauration-component.css',
})
export class RestaurationComponent {
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

  openCart() {
    throw new Error('Method not implemented.');
  }

  selectDay(arg0: string) {
    throw new Error('Method not implemented.');
  }

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Chef animation loaded!', animationItem);
  }
}
