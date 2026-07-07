import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Photo } from '../../../core/models/photo.model';

const photo: Photo = {
  id: '1',
  thumbnailUrl: 'thumb-1',
  fullUrl: 'full-1',
};

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
  });

  it('renders Photos and Favorites navigation links', async () => {
    await fixture.whenStable();
    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map(
      (a) => a.textContent?.trim() ?? '',
    );
    expect(labels.some((l) => l.includes('Photos'))).toBe(true);
    expect(labels.some((l) => l.includes('Favorites'))).toBe(true);
  });

  it('shows a favorites count badge only when there are favorites', async () => {
    const favorites = TestBed.inject(FavoritesService);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.header__count')).toBeNull();

    favorites.add(photo);
    await fixture.whenStable();
    const badge = (fixture.nativeElement as HTMLElement).querySelector('.header__count');
    expect(badge?.textContent?.trim()).toBe('1');
  });
});
