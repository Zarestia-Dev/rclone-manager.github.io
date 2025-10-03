import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'docs', loadComponent: () => import('./pages/docs/docs').then(m => m.Docs) },
  { path: 'downloads', loadComponent: () => import('./pages/downloads/downloads').then(m => m.Downloads) },
  { path: 'faq', loadComponent: () => import('./pages/faq/faq').then(m => m.Faq) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: '**', redirectTo: '' }
];
