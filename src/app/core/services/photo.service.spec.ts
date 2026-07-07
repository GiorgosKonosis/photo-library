import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { PhotoService } from './photo.service';
import { API_DELAY_MS, PHOTOS_PAGE_SIZE } from '../tokens/api-config';
import { PicsumPhoto } from '../models/photo.model';

describe('PhotoService', () => {
  let service: PhotoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_DELAY_MS, useValue: { min: 0, max: 0 } },
        { provide: PHOTOS_PAGE_SIZE, useValue: 3 },
      ],
    });
    service = TestBed.inject(PhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests the correct page and page size', async () => {
    const promise = firstValueFrom(service.getPhotos(2));

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'https://picsum.photos/v2/list' &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '3',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);

    await expect(promise).resolves.toEqual([]);
  });

  it('maps Picsum items to Photo view models', async () => {
    const raw: PicsumPhoto[] = [
      {
        id: '10',
        author: 'Ada Lovelace',
        width: 4000,
        height: 3000,
        url: 'https://unsplash.com/photos/x',
        download_url: 'https://picsum.photos/id/10/4000/3000',
      },
    ];

    const promise = firstValueFrom(service.getPhotos(1));
    httpMock.expectOne((r) => r.url === 'https://picsum.photos/v2/list').flush(raw);

    const [photo] = await promise;
    expect(photo).toEqual({
      id: '10',
      author: 'Ada Lovelace',
      width: 4000,
      height: 3000,
      sourceUrl: 'https://unsplash.com/photos/x',
      thumbnailUrl: 'https://picsum.photos/id/10/300/300',
      fullUrl: 'https://picsum.photos/id/10/1200/800',
    });
  });

  it('buildFromId derives a Photo from an id alone', () => {
    const photo = service.buildFromId('42');
    expect(photo.id).toBe('42');
    expect(photo.thumbnailUrl).toBe('https://picsum.photos/id/42/300/300');
    expect(photo.fullUrl).toBe('https://picsum.photos/id/42/1200/800');
  });
});
