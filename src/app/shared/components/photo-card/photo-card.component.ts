import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  readonly cardClick = output<Photo>();

  onActivate(): void {
    this.cardClick.emit(this.photo());
  }
}
