import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { KeycloakService } from './app/features/auth/service/keycloak-service';

const keycloakService = new KeycloakService();

keycloakService.init().then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
