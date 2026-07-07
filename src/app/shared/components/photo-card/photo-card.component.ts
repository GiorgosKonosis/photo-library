import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Photo } from '../../../core/models/photo.model';

@Component({
  selector: 'app-photo-card',
  imports: [MatIconModule],
  templateUrl: './photo-card.component.html',
  styleUrl: './photo-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoCardComponent {
  readonly photo = input.required<Photo>();
  readonly favorite = input(false);
  readonly toggle = input(false);
  readonly cardClick = output<Photo>();

  readonly ariaLabel = computed(() => {
    const id = this.photo().id;
    if (!this.toggle()) {
      return `Open photo ${id}`;
    }
    return this.favorite() ? `Remove photo ${id} from favorites` : `Add photo ${id} to favorites`;
  });

  onActivate(): void {
    this.cardClick.emit(this.photo());
  }
}
