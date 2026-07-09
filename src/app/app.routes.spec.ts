import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { API_DELAY_MS, API_ERROR_RATE } from './core/tokens/api-config.tokens';
import { PhotosComponent } from './features/photos/photos.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { PhotoDetailComponent } from './features/photo-detail/photo-detail.component';

class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

describe('app routes', () => {
  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: API_DELAY_MS, useValue: { min: 0, max: 0 } },
        { provide: API_ERROR_RATE, useValue: 0 },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves / to the lazy-loaded PhotosComponent', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/', PhotosComponent);
    expect(component).toBeInstanceOf(PhotosComponent);
  });

  it('resolves /favorites to the lazy-loaded FavoritesComponent', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/favorites', FavoritesComponent);
    expect(component).toBeInstanceOf(FavoritesComponent);
  });

  it('resolves /photos/:id to PhotoDetailComponent and binds the id input', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/photos/seed42', PhotoDetailComponent);
    expect(component.id()).toBe('seed42');
  });

  it('redirects bare /photos to the photostream', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/photos');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('redirects unknown routes to the photostream', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/no-such-page');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
