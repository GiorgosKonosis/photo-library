import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PhotoDetailComponent } from './photo-detail.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';

function makePhoto(id: string): Photo {
  return {
    id,
    author: 'Ada Lovelace',
    width: 1,
    height: 1,
    sourceUrl: '',
    thumbnailUrl: `thumb-${id}`,
    fullUrl: `https://picsum.photos/id/${id}/1200/800`,
  };
}

describe('PhotoDetailComponent', () => {
  let fixture: ComponentFixture<PhotoDetailComponent>;
  let favorites: FavoritesService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    favorites = TestBed.inject(FavoritesService);
    fixture = TestBed.createComponent(PhotoDetailComponent);
  });

  it('shows a favorite photo with a Remove button', async () => {
    favorites.add(makePhoto('5'));
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('img')?.getAttribute('src')).toBe(
      'https://picsum.photos/id/5/1200/800',
    );
    expect(host.querySelector('button')?.textContent).toContain('Remove from favorites');
  });

  it('removes from favorites and navigates back', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    favorites.add(makePhoto('5'));
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.removeFromFavorites();

    expect(favorites.isFavorite('5')).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });

  it('falls back to an id-derived photo when the id is not a favorite', async () => {
    fixture.componentRef.setInput('id', '77');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('img')?.getAttribute('src')).toBe(
      'https://picsum.photos/id/77/1200/800',
    );
    expect(host.querySelector('.detail__note')).not.toBeNull();
    expect(host.querySelector('button')).toBeNull();
  });
});
