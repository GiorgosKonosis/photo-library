import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCardComponent } from './photo-card.component';
import { Photo } from '../../../core/models/photo.model';

const photo: Photo = {
  id: 'seed1',
  thumbnailUrl: 'https://picsum.photos/seed/seed1/300/300',
  fullUrl: 'https://picsum.photos/seed/seed1/1200/800',
};

describe('PhotoCardComponent', () => {
  let fixture: ComponentFixture<PhotoCardComponent>;
  let component: PhotoCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PhotoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('photo', photo);
  });

  it('renders the thumbnail', async () => {
    await fixture.whenStable();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img')!;
    expect(img.getAttribute('src')).toBe(photo.thumbnailUrl);
  });

  it('emits cardClick with the photo when activated', async () => {
    await fixture.whenStable();
    const emitted: Photo[] = [];
    component.cardClick.subscribe((p) => emitted.push(p));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(emitted).toEqual([photo]);
  });

  it('shows the favorite badge only when favorite is true', async () => {
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.photo-card__badge')).toBeNull();

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();
    expect(host.querySelector('.photo-card__badge')).not.toBeNull();
  });

  it('exposes toggle state to assistive tech when in toggle mode', async () => {
    fixture.componentRef.setInput('toggle', true);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toContain('Add photo seed1 to favorites');

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toContain('Remove photo seed1 from favorites');
  });

  it('uses a navigational label with no pressed state outside toggle mode', async () => {
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Open photo seed1');
  });
});
