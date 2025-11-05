import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaConfig, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fontAwesomeIcons } from './shared/font-awesome-icons';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ConfirmationComponent } from "./shared/components/notification/confirmation.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent, ConfirmationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('AccelConnectFront');
  private readonly faIconLibrary = inject(FaIconLibrary);
  private readonly faConfig = inject(FaConfig);

  ngOnInit(): void {
    this.initFontAwesome();
  }

  initFontAwesome() {
    this.faConfig.defaultPrefix = 'fas';
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }
}
