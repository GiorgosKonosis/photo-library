import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos',
    loadComponent: () =>
      import('./features/photos/photos.component').then((m) => m.PhotosComponent),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'photos/:id',
    title: 'Photo',
    loadComponent: () =>
      import('./features/photo-detail/photo-detail.component').then((m) => m.PhotoDetailComponent),
  },
  { path: '**', redirectTo: '' },
];
