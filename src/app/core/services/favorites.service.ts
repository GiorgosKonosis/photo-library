import { Service, computed, signal } from '@angular/core';

import { Photo } from '../models/photo.model';

const STORAGE_KEY = 'photo-library.favorites';

@Service()
export class FavoritesService {
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

  toggle(photo: Photo): boolean {
    if (this.isFavorite(photo.id)) {
      this.remove(photo.id);
      return false;
    }
    this.add(photo);
    return true;
  }

  private readFromStorage(): Photo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Photo[]) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._favorites()));
    } catch {
    }
  }
}
