import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'downloads',
    loadComponent: () => import('./pages/downloads/downloads').then(m => m.Downloads)
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs').then(m => m.Docs)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then(m => m.Faq)
  },
  {
    path: 'contact',
    redirectTo: 'faq'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
