import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home-component';
import { RestaurationComponent } from './features/restauration/restauration-component';
import { NotFoundComponent } from './layouts/not-found/not-found-component';
import { PanierComponent } from './features/restauration/panier/panier-component';
import { LoginComponent } from './features/auth/login/login-component';
import { RegisterComponent } from './features/auth/register/register-component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout-component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout-component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout-component';
import { AdminComponent } from './features/restauration/admin/admin-component';
import { FormFoodComponent } from './features/restauration/admin/form-food/form-food-component';
import { AddFoodToRestauComponent } from './features/restauration/admin/add-food-to-restau/add-food-to-restau-component';
import { ListPlatComponent } from './features/restauration/admin/list-plat/list-plat-component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'restauration',
        children: [
          { path: '', component: RestaurationComponent },
          { path: 'cart', component: PanierComponent },
        ],
      },
      { path: 'not-found', component: NotFoundComponent },
    ],
  },

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminComponent },
      { path: 'add-food', component: FormFoodComponent },
      { path: 'add-food-to-restau', component: AddFoodToRestauComponent },
      { path: 'liste-food', component: ListPlatComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '/not-found',
    pathMatch: 'full',
  },
];
