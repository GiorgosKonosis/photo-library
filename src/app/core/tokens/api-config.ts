import { InjectionToken } from '@angular/core';

export interface ApiDelayRange {
  min: number;
  max: number;
}

export const API_DELAY_MS = new InjectionToken<ApiDelayRange>('API_DELAY_MS', {
  providedIn: 'root',
  factory: () => ({ min: 200, max: 300 }),
});

export const PHOTOS_PAGE_SIZE = new InjectionToken<number>('PHOTOS_PAGE_SIZE', {
  providedIn: 'root',
  factory: () => 12,
});
