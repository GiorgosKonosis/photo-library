import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { Photo } from '../models/photo.model';
import { API_DELAY_MS, PHOTOS_PAGE_SIZE } from '../tokens/api-config';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly delayRange = inject(API_DELAY_MS);
  private readonly pageSize = inject(PHOTOS_PAGE_SIZE);

  getPhotos(): Observable<Photo[]> {
    const batch = Array.from({ length: this.pageSize }, () => this.buildFromId(this.randomSeed()));
    return of(batch).pipe(delay(this.randomDelayMs()));
  }

  buildFromId(id: string): Photo {
    return {
      id,
      thumbnailUrl: this.thumbnailUrl(id),
      fullUrl: this.fullUrl(id),
    };
  }

  private thumbnailUrl(seed: string): string {
    return `https://picsum.photos/seed/${seed}/300/300`;
  }

  private fullUrl(seed: string): string {
    return `https://picsum.photos/seed/${seed}/1200/800`;
  }

  private randomSeed(): string {
    return Math.random().toString(36).slice(2, 12);
  }

  private randomDelayMs(): number {
    const { min, max } = this.delayRange;
    return min + Math.random() * (max - min);
  }
}
