import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LoaderComponent);
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a default label', async () => {
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading');
  });

  it('shows the provided label', async () => {
    fixture.componentRef.setInput('label', 'Loading photos…');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading photos…');
  });
});
