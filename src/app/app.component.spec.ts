import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { FavoritesService } from './core/services/favorites.service';
import { Photo } from './core/models/photo.model';

const photo: Photo = {
  id: '1',
  thumbnailUrl: 'thumb-1',
  fullUrl: 'full-1',
};

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the app shell', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header and a router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-header')).not.toBeNull();
    expect(host.querySelector('router-outlet')).not.toBeNull();
  });

  it('feeds the favorites count into the header badge', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.header__count')).toBeNull();

    TestBed.inject(FavoritesService).add(photo);
    await fixture.whenStable();
    expect(host.querySelector('.header__count')?.textContent?.trim()).toBe('1');
  });
});
