import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { PhotosComponent } from './photos.component';
import { PhotoService } from '../../core/services/photo.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';

function pageOf(ids: string[]): Photo[] {
  return ids.map((id) => ({
    id,
    thumbnailUrl: `thumb-${id}`,
    fullUrl: `full-${id}`,
  }));
}

class MockIntersectionObserver {
  static last: MockIntersectionObserver | undefined;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(private readonly cb: IntersectionObserverCallback) {
    MockIntersectionObserver.last = this;
  }
  emit(isIntersecting: boolean): void {
    this.cb(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('PhotosComponent', () => {
  let fixture: ComponentFixture<PhotosComponent>;
  let component: PhotosComponent;
  let photoService: { getPhotos: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
    MockIntersectionObserver.last = undefined;
    localStorage.clear();
    photoService = { getPhotos: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PhotosComponent],
      providers: [{ provide: PhotoService, useValue: photoService }, FavoritesService],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotosComponent);
    component = fixture.componentInstance;
  });

  it('loads the first page on init', async () => {
    photoService.getPhotos.mockReturnValueOnce(of(pageOf(['1', '2'])));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(1);
    expect(component.photos().map((p) => p.id)).toEqual(['1', '2']);
    expect(component.loading()).toBe(false);
  });

  it('appends subsequent pages on loadMore', async () => {
    photoService.getPhotos
      .mockReturnValueOnce(of(pageOf(['1'])))
      .mockReturnValueOnce(of(pageOf(['2'])));
    fixture.detectChanges();
    await fixture.whenStable();

    component.loadMore();
    await fixture.whenStable();

    expect(component.photos().map((p) => p.id)).toEqual(['1', '2']);
  });

  it('loads more when the IntersectionObserver reports the sentinel is visible', async () => {
    photoService.getPhotos
      .mockReturnValueOnce(of(pageOf(['1'])))
      .mockReturnValueOnce(of(pageOf(['2'])));
    fixture.detectChanges();
    await fixture.whenStable();

    const observer = MockIntersectionObserver.last!;
    expect(observer.observe).toHaveBeenCalledWith(component['sentinel']().nativeElement);

    observer.emit(true);
    await fixture.whenStable();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(2);
    expect(component.photos().map((p) => p.id)).toEqual(['1', '2']);
  });

  it('does NOT load when the sentinel is reported not intersecting', async () => {
    photoService.getPhotos.mockReturnValueOnce(of(pageOf(['1'])));
    fixture.detectChanges();
    await fixture.whenStable();

    MockIntersectionObserver.last!.emit(false);
    await fixture.whenStable();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(1);
  });

  it('does not issue concurrent requests while a load is in flight', () => {
    photoService.getPhotos.mockReturnValue(new Observable<Photo[]>(() => {}));

    component.loadMore();
    component.loadMore();

    expect(photoService.getPhotos).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(true);
  });

  it('sets the error flag when a request fails, and clears it on a successful retry', async () => {
    photoService.getPhotos.mockReturnValueOnce(
      new Observable<Photo[]>((subscriber) => subscriber.error(new Error('network'))),
    );
    component.loadMore();
    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);

    photoService.getPhotos.mockReturnValueOnce(of(pageOf(['1'])));
    component.loadMore();
    expect(component.error()).toBe(false);
    expect(component.photos().map((p) => p.id)).toEqual(['1']);
  });

  it('toggles favorites when a photo is clicked', async () => {
    photoService.getPhotos.mockReturnValueOnce(of(pageOf(['1'])));
    fixture.detectChanges();
    await fixture.whenStable();

    const favorites = TestBed.inject(FavoritesService);
    component.onToggleFavorite(component.photos()[0]);
    expect(favorites.isFavorite('1')).toBe(true);

    component.onToggleFavorite(component.photos()[0]);
    expect(favorites.isFavorite('1')).toBe(false);
  });

  it('disconnects the observer on destroy', () => {
    photoService.getPhotos.mockReturnValueOnce(of(pageOf(['1'])));
    fixture.detectChanges();
    const observer = MockIntersectionObserver.last!;
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
