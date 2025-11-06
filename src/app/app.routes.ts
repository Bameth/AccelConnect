import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home-component';
import { NotFoundComponent } from './layouts/not-found/not-found-component';
import { PanierComponent } from './features/restauration/panier/panier.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout-component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout-component';
import { AdminComponent } from './features/restauration/admin/admin-component';
import { FormFoodComponent } from './features/restauration/admin/form-food/form-food-component';
import { AddFoodToRestauComponent } from './features/restauration/admin/add-food-to-restau/add-food-to-restau-component';
import { ListPlatComponent } from './features/restauration/admin/list-plat/list-plat-component';
import { ListeRestaurant } from './features/restauration/admin/liste-restaurant/liste-restaurant';
import { FormRestaurant } from './features/restauration/admin/form-restaurant/form-restaurant';
import { AdminWalletManagementComponent } from './features/restauration/admin/admin-wallet-management/admin-wallet-management.component';
import { MyOrdersComponent } from './features/restauration/order/my-orders-component/my-orders-component';
import { RestaurationComponent } from './features/restauration/restauration.component';
import { adminOnlyGuard } from './features/auth/guards/role.guard';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  // Routes utilisateurs normaux (MainLayout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'restauration',
        children: [
          { path: '', component: RestaurationComponent },
          { path: 'cart', component: PanierComponent },
          { path: 'my-orders', component: MyOrdersComponent },
        ],
      },
      { path: 'not-found', component: NotFoundComponent },
    ],
  },

  // Routes admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminOnlyGuard],
    children: [
      { path: '', component: AdminComponent },
      {
        path: 'dashboard',
        component: AdminComponent,
        data: { title: 'Dashboard Admin' },
      },
      {
        path: 'add-food',
        component: FormFoodComponent,
        data: { title: 'Ajouter un Plat' },
      },
      {
        path: 'add-food-to-restau',
        component: AddFoodToRestauComponent,
        data: { title: 'Associer Plat-Restaurant' },
      },
      {
        path: 'liste-food',
        component: ListPlatComponent,
        data: { title: 'Liste des Plats' },
      },
      {
        path: 'liste-restaurant',
        component: ListeRestaurant,
        data: { title: 'Liste des Restaurants' },
      },
      {
        path: 'add-restaurant',
        component: FormRestaurant,
        data: { title: 'Ajouter un Restaurant' },
      },
      {
        path: 'wallets',
        component: AdminWalletManagementComponent,
        data: { title: 'Gestion des Portefeuilles' },
      },
    ],
  },

  // Redirection pour toutes les routes non trouvées
  { path: '**', redirectTo: '/not-found', pathMatch: 'full' },
];