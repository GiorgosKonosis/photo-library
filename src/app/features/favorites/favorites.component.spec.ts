import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FavoritesComponent } from './favorites.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';

function makePhoto(id: string): Photo {
  return {
    id,
    author: 'A',
    width: 1,
    height: 1,
    sourceUrl: '',
    thumbnailUrl: `thumb-${id}`,
    fullUrl: `full-${id}`,
  };
}

describe('FavoritesComponent', () => {
  let fixture: ComponentFixture<FavoritesComponent>;
  let favorites: FavoritesService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    favorites = TestBed.inject(FavoritesService);
    fixture = TestBed.createComponent(FavoritesComponent);
  });

  it('shows the empty state when there are no favorites', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.favorites__empty')).not.toBeNull();
    expect(host.querySelectorAll('app-photo-card').length).toBe(0);
  });

  it('renders one card per favorite', async () => {
    favorites.add(makePhoto('1'));
    favorites.add(makePhoto('2'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-photo-card').length).toBe(2);
  });

  it('navigates to the detail page when a favorite is opened', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.openPhoto(makePhoto('7'));

    expect(navigate).toHaveBeenCalledWith(['/photos', '7']);
  });
});
