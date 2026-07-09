import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PhotoService } from './photo.service';
import { Photo } from '../models/photo.model';
import { API_DELAY_MS, API_ERROR_RATE, PHOTOS_PAGE_SIZE } from '../tokens/api-config.tokens';

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: API_DELAY_MS, useValue: { min: 0, max: 0 } },
        { provide: PHOTOS_PAGE_SIZE, useValue: 3 },
        { provide: API_ERROR_RATE, useValue: 0 },
      ],
    });
    service = TestBed.inject(PhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns a full page of photos', async () => {
    const photos = await firstValueFrom(service.getPhotos());
    expect(photos).toHaveLength(3);
  });

  it('gives each photo a stable id and seed-based Picsum URLs', async () => {
    const [photo] = await firstValueFrom(service.getPhotos());
    expect(photo.id).toBeTruthy();
    expect(photo.thumbnailUrl).toBe(`https://picsum.photos/seed/${photo.id}/300/300`);
    expect(photo.fullUrl).toBe(`https://picsum.photos/seed/${photo.id}/1200/800`);
  });

  it('produces a different random set on each call (infinite, random stream)', async () => {
    const first = (await firstValueFrom(service.getPhotos())).map((p) => p.id);
    const second = (await firstValueFrom(service.getPhotos())).map((p) => p.id);
    expect(first).not.toEqual(second);
  });

  it('errors with the configured probability (reachable error/retry state)', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_DELAY_MS, useValue: { min: 0, max: 0 } },
        { provide: API_ERROR_RATE, useValue: 1 },
      ],
    });
    const failing = TestBed.inject(PhotoService);
    await expect(firstValueFrom(failing.getPhotos())).rejects.toThrow('Emulated API failure');
  });

  it('buildFromId derives a Photo from a seed alone (deep-link support)', () => {
    const photo = service.buildFromId('abc123');
    expect(photo).toEqual({
      id: 'abc123',
      thumbnailUrl: 'https://picsum.photos/seed/abc123/300/300',
      fullUrl: 'https://picsum.photos/seed/abc123/1200/800',
    });
  });
});

describe('PhotoService (emulated API delay)', () => {
  let service: PhotoService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_DELAY_MS, useValue: { min: 200, max: 300 } },
        { provide: PHOTOS_PAGE_SIZE, useValue: 3 },
        { provide: API_ERROR_RATE, useValue: 0 },
      ],
    });
    service = TestBed.inject(PhotoService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit before the minimum configured delay', () => {
    let emitted: Photo[] | undefined;
    service.getPhotos().subscribe((photos) => (emitted = photos));

    vi.advanceTimersByTime(199);
    expect(emitted).toBeUndefined();
  });

  it('emits a full page once the maximum configured delay has elapsed', () => {
    let emitted: Photo[] | undefined;
    service.getPhotos().subscribe((photos) => (emitted = photos));

    vi.advanceTimersByTime(300);
    expect(emitted).toHaveLength(3);
  });
});
