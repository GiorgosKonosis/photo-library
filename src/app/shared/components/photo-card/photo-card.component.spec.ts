import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCardComponent } from './photo-card.component';
import { Photo } from '../../../core/models/photo.model';

const photo: Photo = {
  id: '1',
  author: 'Grace Hopper',
  width: 1,
  height: 1,
  sourceUrl: '',
  thumbnailUrl: 'https://picsum.photos/id/1/300/300',
  fullUrl: 'https://picsum.photos/id/1/1200/800',
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

  it('renders the thumbnail with alt text', async () => {
    await fixture.whenStable();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img')!;
    expect(img.getAttribute('src')).toBe(photo.thumbnailUrl);
    expect(img.getAttribute('alt')).toContain('Grace Hopper');
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
});
