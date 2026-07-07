import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';

@Component({
  selector: 'app-favorites',
  imports: [PhotoCardComponent, MatIconModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

  readonly favorites = this.favoritesService.favorites;

  openPhoto(photo: Photo): void {
    this.router.navigate(['/photos', photo.id]);
  }
}
