import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home-component';
import { RestaurationComponent } from './features/restauration/restauration-component';
import { NotFoundComponent } from './layouts/not-found/not-found-component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'restauration',
    component: RestaurationComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '/not-found',
    pathMatch: 'full',
  },
];
