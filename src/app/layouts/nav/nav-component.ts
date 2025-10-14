import { Component } from '@angular/core';
import { AppConfig } from '../../core/config/app.config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-component',
  imports: [CommonModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent {
  logoUrl = AppConfig.logoUrl;
  avatarUrl = AppConfig.defaultAvatar;
}
