import { TestBed } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';
import { Photo } from '../models/photo.model';

const STORAGE_KEY = 'photo-library.favorites';

function makePhoto(id: string): Photo {
  return {
    id,
    author: 'Author ' + id,
    width: 1,
    height: 1,
    sourceUrl: '',
    thumbnailUrl: `thumb-${id}`,
    fullUrl: `full-${id}`,
  };
}

function createService(): FavoritesService {
  TestBed.configureTestingModule({});
  return TestBed.inject(FavoritesService);
}

describe('FavoritesService', () => {
  beforeEach(() => localStorage.clear());

  it('adds a photo to favorites', () => {
    const service = createService();
    service.add(makePhoto('1'));
    expect(service.isFavorite('1')).toBe(true);
    expect(service.count()).toBe(1);
  });

  it('does not add duplicates', () => {
    const service = createService();
    service.add(makePhoto('1'));
    service.add(makePhoto('1'));
    expect(service.count()).toBe(1);
  });

  it('removes a photo', () => {
    const service = createService();
    service.add(makePhoto('1'));
    service.remove('1');
    expect(service.isFavorite('1')).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('toggle adds when absent and removes when present', () => {
    const service = createService();
    expect(service.toggle(makePhoto('7'))).toBe(true);
    expect(service.isFavorite('7')).toBe(true);
    expect(service.toggle(makePhoto('7'))).toBe(false);
    expect(service.isFavorite('7')).toBe(false);
  });

  it('exposes a favorite by id', () => {
    const service = createService();
    service.add(makePhoto('3'));
    expect(service.getById('3')?.id).toBe('3');
    expect(service.getById('nope')).toBeUndefined();
  });

  it('persists favorites to localStorage', () => {
    const service = createService();
    service.add(makePhoto('99'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('99');
  });

  it('restores favorites from localStorage (survives a refresh)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([makePhoto('5')]));
    const service = createService();
    expect(service.isFavorite('5')).toBe(true);
    expect(service.getById('5')?.id).toBe('5');
  });

  it('tolerates corrupt storage without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{ not valid json');
    const service = createService();
    expect(service.count()).toBe(0);
  });
});
