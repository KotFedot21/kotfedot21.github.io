import { Routes } from '@angular/router';
import { HomeComponent } from './ui/pages/home/home';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    // { path: 'blog', loadComponent: () => import('./ui/pages/home/home').then(m => m.BlogComponent) },
    { path: '**', redirectTo: '' }
];