# Photo Library

An Angular photo library featuring an **infinite, random photostream** and a
persistent **Favorites** library.

Photos come from the [Picsum](https://picsum.photos) API. Favorites are stored
in the browser (`localStorage`), so there is no backend.

## Features

- **Photos** (`/`) - an infinite-scrolling stream of random photos. New pages
  load automatically as you scroll, with a loading spinner. Clicking a photo
  saves it to (or removes it from) your Favorites, with a heart overlay showing
  the saved state.
- **Favorites** (`/favorites`) - a grid of your saved photos (no infinite
  scroll). Clicking one opens its single-photo page. The list **survives a page
  refresh**.
- **Single photo** (`/photos/:id`) - a full-screen photo with an **Add to /
  Remove from favorites** action overlaid. The header stays in place, as on
  every page.
- **Header** - switches between Photos and Favorites; the active view is
  highlighted, and the Favorites tab shows a live count badge.

## Tech stack

- **Angular 22** (standalone components, [zoneless](https://angular.dev/guide/zoneless) change detection, signals)
- **Angular Material** (Material 3) + **SCSS**
- **Angular Router** with lazy-loaded feature routes
- **Vitest** for unit tests
- **ESLint** (angular-eslint) + **Prettier**
- Infinite scroll implemented **from scratch** with `IntersectionObserver`

## Getting started

Requirements: **Node.js 22.22+ or 24.15+** and npm.

```bash
npm install       # install dependencies
npm start         # dev server at http://localhost:4200
npm test          # unit tests (watch mode in a terminal)
npm run test:ci   # unit tests, single run
npm run lint      # ESLint
npm run build     # production build into dist/
```

## Project structure

```
src/app/
├─ core/                         # app-wide, non-UI concerns
│  ├─ models/photo.model.ts      # Photo view model + raw Picsum shape
│  ├─ tokens/api-config.tokens.ts # injectable API delay, error rate & page size
│  └─ services/
│     ├─ photo.service.ts        # generates the random Picsum stream (+ emulated delay & failures)
│     └─ favorites.service.ts    # favorites state (signal), persists seeds to localStorage
├─ shared/components/            # reusable, presentational components
│  ├─ header/                    # top nav with active-view highlight
│  ├─ photo-card/                # reusable photo tile (emits cardClick)
│  └─ loader/                    # spinner + label
├─ features/                     # routed screens (lazy-loaded)
│  ├─ photos/                    # infinite photostream
│  ├─ favorites/                 # favorites grid
│  └─ photo-detail/             # single-photo page
├─ app.routes.ts                 # route table
├─ app.config.ts                 # providers (router + component input binding)
└─ app.component.ts / .html      # shell: header + <router-outlet>
```

## Design decisions & notes

**Photos come from Picsum random seeds** (`picsum.photos/seed/{seed}/{w}/{h}`).
The same seed always returns the same image, so I use the seed as the photo id.
That gives me a stable key for favorites and for `/photos/:id` deep links, and
since a seed can be any string the stream never runs out and never repeats an
id. You get a different set every session.

**The API is faked.** There's no backend, so `PhotoService.getPhotos()` builds
a batch locally and resolves it after a random 200-300ms delay to make it feel
like a network call (`API_DELAY_MS` in `core/tokens/api-config.tokens.ts`).
It also fails about 1 request in 10 on purpose (`API_ERROR_RATE`), so the
error message and its Try again button are actually reachable, not just dead
code. Both knobs are injection tokens, so tests pin the delay to 0 and the
error rate to 0 (or to 1, for the failure tests).

**Infinite scroll is hand-rolled**, no library. `PhotosComponent` watches a
sentinel div at the bottom of the grid with an IntersectionObserver and fetches
the next page when it gets near the viewport. A loading flag prevents
overlapping requests, and the observer is re-armed after each load so the grid
keeps filling on tall screens where one page isn't enough.

**State:** `FavoritesService` keeps the library in a signal and writes every
change through to localStorage. Only the seeds are persisted; the image URLs
are re-derived from them on load, so there's no redundant data to go stale.
Components just read the signal. Route params are mapped to component inputs
with `withComponentInputBinding()`.

`PhotoCardComponent` is purely presentational and only emits `cardClick`. The
Photos page treats a click as "toggle favorite", the Favorites page treats it
as "open detail".

**One deviation from the task:** the spec says clicking a photo adds it to
favorites. I made it a toggle instead, since otherwise there's no way to undo
an accidental click. Adding still works as described for any photo that isn't
saved yet.

**Accessibility:** cards are real `<button>` elements so they're keyboard
friendly, images have alt text, and the active nav link gets `aria-current`.


## Testing

Unit tests cover the services (seed-URL building, the 200-300 ms delay bounds,
the simulated failure path, favorites CRUD and persistence, corrupt-storage
handling) and every component (rendering, the infinite-scroll load/guard/error
logic, favorite toggling, and navigation).

```bash
npm test          # watch mode
npm run test:ci   # single run
```
