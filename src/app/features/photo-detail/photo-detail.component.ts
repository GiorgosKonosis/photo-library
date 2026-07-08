import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FavoritesService } from '../../core/services/favorites.service';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-photo-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailComponent {
  private readonly favoritesService = inject(FavoritesService);
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly photo = computed(
    () => this.favoritesService.getById(this.id()) ?? this.photoService.buildFromId(this.id()),
  );

  readonly isFavorite = computed(() => this.favoritesService.isFavorite(this.id()));

  removeFromFavorites(): void {
    this.favoritesService.remove(this.id());
    this.router.navigate(['/favorites']);
  }
}
