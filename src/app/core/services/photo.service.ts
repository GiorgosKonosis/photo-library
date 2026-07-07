import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map } from 'rxjs';

import { Photo, PicsumPhoto } from '../models/photo.model';
import { API_DELAY_MS, PHOTOS_PAGE_SIZE } from '../tokens/api-config';

@Service()
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly delayRange = inject(API_DELAY_MS);
  private readonly pageSize = inject(PHOTOS_PAGE_SIZE);

  private readonly listUrl = 'https://picsum.photos/v2/list';

  getPhotos(page: number): Observable<Photo[]> {
    const params = { page: String(page), limit: String(this.pageSize) };
    return this.http.get<PicsumPhoto[]>(this.listUrl, { params }).pipe(
      delay(this.randomDelayMs()),
      map((items) => items.map((item) => this.toPhoto(item))),
    );
  }

  buildFromId(id: string): Photo {
    return {
      id,
      author: '',
      width: 0,
      height: 0,
      sourceUrl: `https://picsum.photos/id/${id}/info`,
      thumbnailUrl: this.thumbnailUrl(id),
      fullUrl: this.fullUrl(id),
    };
  }

  private toPhoto(item: PicsumPhoto): Photo {
    return {
      id: item.id,
      author: item.author,
      width: item.width,
      height: item.height,
      sourceUrl: item.url,
      thumbnailUrl: this.thumbnailUrl(item.id),
      fullUrl: this.fullUrl(item.id),
    };
  }

  private thumbnailUrl(id: string): string {
    return `https://picsum.photos/id/${id}/300/300`;
  }

  private fullUrl(id: string): string {
    return `https://picsum.photos/id/${id}/1200/800`;
  }

  private randomDelayMs(): number {
    const { min, max } = this.delayRange;
    return min + Math.random() * (max - min);
  }
}
