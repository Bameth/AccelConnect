import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-panier-component',
  imports: [FontAwesomeModule, LottieComponent, CommonModule, RouterLink],
  templateUrl: './panier-component.html',
  styleUrl: './panier-component.css',
})
export class PanierComponent implements OnInit {
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Soupou Kandia',
      description: 'Plat traditionnel sénégalais',
      price: 1000,
      quantity: 6,
      image:
        'https://cn-geo1.uber.com/image-proc/resize/eats/format=webp/width=550/height=440/quality=70/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC9pbWFnZS1wcm9jL3Byb2Nlc3NlZF9pbWFnZXMvOGFhNzYxOTEyYzg4ZGY4MjY1YmM4NTc2NzgwYzFlMDYvYzY3ZmM2NWU5YjRlMTZhNTUzZWI3NTc0ZmJhMDkwZjEuanBlZw==',
    },
    {
      id: 2,
      name: 'Thiéboudienne',
      description: 'Riz au poisson avec légumes',
      price: 1500,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    },
    {
      id: 3,
      name: 'Yassa Poulet',
      description: 'Poulet mariné aux oignons',
      price: 1200,
      quantity: 3,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    },
  ];

  isAnimating: boolean = false;
  lottieLoaded: boolean = false;

  // Configuration de l'animation Lottie
  emptyCartOptions: AnimationOptions = {
    path: '/assets/lottie/emptycart.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  onAnimationCreated(animationItem: AnimationItem): void {
    console.log('Empty cart animation loaded!', animationItem);
  }

  ngOnInit() {
    setTimeout(() => {
      this.lottieLoaded = true;
    }, 500);
  }

  updateQuantity(id: number, delta: number): void {
    this.isAnimating = true;
    this.cartItems = this.cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setTimeout(() => (this.isAnimating = false), 300);
  }

  removeItem(id: number): void {
    this.cartItems = this.cartItems.filter((item) => item.id !== id);
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get tva(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get total(): number {
    return this.subtotal + this.tva;
  }
}
