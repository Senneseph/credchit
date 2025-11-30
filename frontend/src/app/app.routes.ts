import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'wallet',
    loadComponent: () => import('./pages/wallet/wallet.component').then(m => m.WalletComponent),
  },
  {
    path: 'merchants',
    loadComponent: () => import('./pages/merchants/merchants.component').then(m => m.MerchantsComponent),
  },
  {
    path: 'pay',
    loadComponent: () => import('./pages/pay/pay.component').then(m => m.PayComponent),
  },
];

