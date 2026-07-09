import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { PhotoDetailComponent } from './photo-detail.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo.model';

function makePhoto(id: string): Photo {
  return {
    id,
    thumbnailUrl: `thumb-${id}`,
    fullUrl: `https://picsum.photos/seed/${id}/1200/800`,
  };
}

describe('PhotoDetailComponent', () => {
  let fixture: ComponentFixture<PhotoDetailComponent>;
  let favorites: FavoritesService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [provideRouter([])],
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
      'https://picsum.photos/seed/5/1200/800',
    );
    expect(host.querySelector('button')?.textContent).toContain('Remove from favorites');
  });

  it('removes from favorites and navigates back when the Remove button is clicked', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    favorites.add(makePhoto('5'));
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();

    expect(favorites.isFavorite('5')).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });

  it('falls back to a seed-derived photo when the id is not a favorite', async () => {
    fixture.componentRef.setInput('id', 'xyz');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('img')?.getAttribute('src')).toBe(
      'https://picsum.photos/seed/xyz/1200/800',
    );
    expect(host.querySelector('.detail__note')).not.toBeNull();
    expect(host.querySelector('button')?.textContent).toContain('Add to favorites');
  });

  it('adds a non-favorite to favorites and switches to the Remove action', async () => {
    fixture.componentRef.setInput('id', 'xyz');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector('button')!.click();
    fixture.detectChanges();

    expect(favorites.isFavorite('xyz')).toBe(true);
    expect(host.querySelector('button')?.textContent).toContain('Remove from favorites');
  });
});

describe('PhotoDetailComponent (route param binding)', () => {
  beforeEach(() => localStorage.clear());

  it('binds the :id route param to the id input and renders that photo', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'photos/:id', component: PhotoDetailComponent }],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/photos/routed99', PhotoDetailComponent);

    expect(component.id()).toBe('routed99');
    const img = harness.routeNativeElement!.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://picsum.photos/seed/routed99/1200/800');
  });
});
