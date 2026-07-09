import { Injectable, computed, inject, signal } from '@angular/core';

import { Photo } from '../models/photo.model';
import { PhotoService } from './photo.service';

const STORAGE_KEY = 'photo-library.favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly photoService = inject(PhotoService);

  private readonly _favorites = signal<Photo[]>(this.readFromStorage());

  readonly favorites = this._favorites.asReadonly();

  readonly count = computed(() => this._favorites().length);

  isFavorite(id: string): boolean {
    return this._favorites().some((photo) => photo.id === id);
  }

  getById(id: string): Photo | undefined {
    return this._favorites().find((photo) => photo.id === id);
  }

  add(photo: Photo): void {
    if (this.isFavorite(photo.id)) {
      return;
    }
    this._favorites.update((list) => [...list, photo]);
    this.writeToStorage();
  }

  remove(id: string): void {
    this._favorites.update((list) => list.filter((photo) => photo.id !== id));
    this.writeToStorage();
  }

  toggle(photo: Photo): void {
    if (this.isFavorite(photo.id)) {
      this.remove(photo.id);
    } else {
      this.add(photo);
    }
  }

  private readFromStorage(): Photo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter((id): id is string => typeof id === 'string')
        .map((id) => this.photoService.buildFromId(id));
    } catch {
      return [];
    }
  }

  private writeToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._favorites().map((p) => p.id)));
    } catch {}
  }
}
