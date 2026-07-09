import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

import { PhotoService } from '../../core/services/photo.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-photos',
  imports: [PhotoCardComponent, LoaderComponent, MatButtonModule],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly photoService = inject(PhotoService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.loadMore();
        }
      },
      { rootMargin: '300px' },
    );
    this.observer.observe(this.sentinel().nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  onToggleFavorite(photo: Photo): void {
    this.favoritesService.toggle(photo);
  }

  loadMore(): void {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set(false);

    this.photoService
      .getPhotos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (batch) => {
          this.photos.update((current) => [...current, ...batch]);
          this.loading.set(false);
          this.rearmObserver();
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  private rearmObserver(): void {
    if (!this.observer) {
      return;
    }
    const el = this.sentinel().nativeElement;
    this.observer.unobserve(el);
    this.observer.observe(el);
  }
}
